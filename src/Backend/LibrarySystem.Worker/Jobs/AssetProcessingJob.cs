using LibrarySystem.Domain.Entities.Dam;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xabe.FFmpeg;
using ImageMagick;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;

namespace LibrarySystem.Worker.Jobs
{
    public class AssetProcessingJob
    {
        private readonly IServiceProvider _serviceProvider;

        public AssetProcessingJob(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        private async Task ReportStatusAsync(int assetId, string status, string message)
        {
            try
            {
                var factory = _serviceProvider.GetRequiredService<IHttpClientFactory>();
                var client = factory.CreateClient();
                var payload = new { AssetId = assetId, Status = status, Message = message };
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                await client.PostAsync("https://localhost:7219/api/internal/notify/asset-status", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Worker] Cannot report status: {ex.Message}");
            }
        }

        public async Task ProcessAssetAsync(int assetId)
        {
            // Resolve scoped DbContext
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var asset = await context.DigitalAssets.FirstOrDefaultAsync(a => a.Id == assetId);
            if (asset == null)
            {
                Console.WriteLine($"[Worker] Không tìm thấy AssetId: {assetId}");
                return;
            }

            Console.WriteLine($"[Worker] Bắt đầu xử lý AssetId: {assetId} - {asset.Title}");
            await ReportStatusAsync(assetId, "Processing", "Bắt đầu xử lý File");

            string extractedText = "";

            try
            {
                if (asset.MimeType.Contains("pdf", StringComparison.OrdinalIgnoreCase))
                {
                    await ReportStatusAsync(assetId, "Thumbnail", "Đang tạo ảnh thu nhỏ...");
                    // Fallback tạo Thumbnail cho PDF bằng Magick.NET
                    GeneratePdfThumbnail(asset.FilePath, asset.Id);
                    
                    await ReportStatusAsync(assetId, "OCR", "Đang trích xuất nội dung văn bản...");
                    // Trích xuất text bằng iText7
                    extractedText = ExtractTextFromPdf(asset.FilePath);
                    Console.WriteLine($"[Worker] Trích xuất được {extractedText.Length} ký tự Text từ PDF.");
                }
                else if (asset.MimeType.Contains("video", StringComparison.OrdinalIgnoreCase))
                {
                    await ReportStatusAsync(assetId, "Thumbnail", "Đang trích xuất Frame Video...");
                    await GenerateVideoThumbnailAsync(asset.FilePath, asset.Id);
                }
                else if (asset.MimeType.Contains("image", StringComparison.OrdinalIgnoreCase))
                {
                    await ReportStatusAsync(assetId, "OCR", "Chờ hệ thống OCR hình ảnh...");
                    // Trích xuất text bằng Tesseract (Mô phỏng)
                    Console.WriteLine("[Worker] Bỏ qua trích xuất OCR cho Image (Chờ cài Tesseract).");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Worker Warning] Lỗi trong quá trình tạo Thumbnail/Text (Fallback an toàn): {ex.Message}");
            }

            // Sync to Elasticsearch (Task 4.3)
            if (!string.IsNullOrEmpty(extractedText))
            {
                var esService = scope.ServiceProvider.GetRequiredService<IElasticsearchService>();
                var doc = new DigitalAssetDocument
                {
                    Id = asset.Id,
                    Title = asset.Title,
                    FullText = extractedText
                };
                bool success = await esService.IndexDigitalAssetAsync(doc);
                if (success)
                    Console.WriteLine($"[Elasticsearch] Đã index Asset {asset.Id} thành công.");
                else
                    Console.WriteLine($"[Elasticsearch] Lỗi khi index Asset {asset.Id}.");
            }

            await ReportStatusAsync(assetId, "Completed", "Hoàn tất xử lý.");
        }

        private void GeneratePdfThumbnail(string pdfPath, int assetId)
        {
            try
            {
                var settings = new MagickReadSettings { Density = new Density(150), FrameIndex = 0, FrameCount = 1 };
                using var images = new MagickImageCollection();
                images.Read(pdfPath, settings);

                var firstPage = images[0];
                firstPage.Format = MagickFormat.Jpg;
                firstPage.Quality = 80;

                string thumbFolder = Path.Combine(Path.GetTempPath(), "slib_thumbnails");
                if (!Directory.Exists(thumbFolder)) Directory.CreateDirectory(thumbFolder);

                string destPath = Path.Combine(thumbFolder, $"thumb_{assetId}.jpg");
                firstPage.Write(destPath);
                Console.WriteLine($"[Worker] Tạo Thumbnail PDF thành công: {destPath}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Ghostscript chưa được cài đặt hoặc lỗi: {ex.Message}");
            }
        }

        private async Task GenerateVideoThumbnailAsync(string videoPath, int assetId)
        {
            try
            {
                string thumbFolder = Path.Combine(Path.GetTempPath(), "slib_thumbnails");
                if (!Directory.Exists(thumbFolder)) Directory.CreateDirectory(thumbFolder);

                string destPath = Path.Combine(thumbFolder, $"thumb_{assetId}.jpg");
                
                // Lấy frame ở giây thứ 2
                var conversion = await FFmpeg.Conversions.FromSnippet.Snapshot(videoPath, destPath, TimeSpan.FromSeconds(2));
                var result = await conversion.Start();
                Console.WriteLine($"[Worker] Tạo Thumbnail Video thành công: {destPath}");
            }
            catch (Exception ex)
            {
                throw new Exception($"FFMPEG chưa được cài đặt hoặc lỗi: {ex.Message}");
            }
        }

        private string ExtractTextFromPdf(string pdfPath)
        {
            try
            {
                using var reader = new PdfReader(pdfPath);
                using var pdfDoc = new PdfDocument(reader);
                
                string text = "";
                for (int i = 1; i <= pdfDoc.GetNumberOfPages(); i++)
                {
                    var page = pdfDoc.GetPage(i);
                    var strategy = new SimpleTextExtractionStrategy();
                    text += PdfTextExtractor.GetTextFromPage(page, strategy) + "\n";
                    
                    // Giới hạn text (ví dụ 100 trang đầu để tránh out-of-memory)
                    if (i > 100) break;
                }
                return text;
            }
            catch
            {
                return "";
            }
        }
    }
}
