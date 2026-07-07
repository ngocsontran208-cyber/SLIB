using SkiaSharp;
using System;
using System.IO;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities.Dam;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.Kernel.Colors;
using iText.Kernel.Pdf.Extgstate;

namespace LibrarySystem.Infrastructure.DrmEngine
{
    public interface IDrmEngineService
    {
        byte[] ApplyDynamicWatermark(byte[] pdfPageImage, string userEmail, string watermarkTemplate);
        Task<Stream> ProcessPdfStreamAsync(Stream sourceStream, DrmPolicy policy, string userInfo);
    }

    public class DrmEngineService : IDrmEngineService
    {
        public byte[] ApplyDynamicWatermark(byte[] pdfPageImage, string userEmail, string watermarkTemplate)
        {
            // 1. Phân giải các biến động trong Template
            string finalWatermarkText = watermarkTemplate
                .Replace("%Email%", userEmail)
                .Replace("%DateTime%", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

            // 2. Sử dụng SkiaSharp để giải mã ảnh và vẽ Watermark
            using var inputStream = new MemoryStream(pdfPageImage);
            using var originalBitmap = SKBitmap.Decode(inputStream);
            
            // Nếu decode thất bại (file rỗng hoặc không phải ảnh hợp lệ), ném lỗi hoặc trả về nguyên bản
            if (originalBitmap == null) return pdfPageImage; 

            // Tạo Surface để vẽ lên ảnh gốc
            var imageInfo = new SKImageInfo(originalBitmap.Width, originalBitmap.Height);
            using var surface = SKSurface.Create(imageInfo);
            using var canvas = surface.Canvas;

            // Vẽ lại ảnh gốc lên canvas
            canvas.DrawBitmap(originalBitmap, 0, 0);

            // 3. Thiết lập font và màu sắc cho Watermark
            using var font = new SKFont(SKTypeface.Default, 48);
            using var paint = new SKPaint
            {
                Color = new SKColor(255, 0, 0, 100), // Đỏ, độ mờ (Alpha) = 100/255 để in chìm
                IsAntialias = true
            };

            // 4. Tính toán góc nghiêng và vị trí tâm
            canvas.Translate(imageInfo.Width / 2f, imageInfo.Height / 2f);
            canvas.RotateDegrees(-45); // Xoay chéo 45 độ

            // Vẽ đoạn text lặp lại nhiều lần nếu muốn phủ kín, ở đây vẽ 1 dòng ngay tâm
            canvas.DrawText(finalWatermarkText, -200, 0, font, paint);

            // 5. Kết xuất (Render) lại thành mảng byte hình ảnh (PNG)
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            
            return data.ToArray();
        }

        public async Task<Stream> ProcessPdfStreamAsync(Stream sourceStream, DrmPolicy policy, string userInfo)
        {
            var outStream = new MemoryStream();
            
            if (sourceStream.CanSeek)
                sourceStream.Position = 0;

            // Sử dụng iText7 để thao tác PDF
            using (var pdfReader = new PdfReader(sourceStream))
            using (var pdfWriter = new PdfWriter(outStream))
            {
                // Ngăn PdfWriter đóng outStream khi kết thúc block using
                pdfWriter.SetCloseStream(false);
                
                using (var pdfDoc = new PdfDocument(pdfReader, pdfWriter))
                {
                    int totalPages = pdfDoc.GetNumberOfPages();
                    int pagesToKeep = policy.MaxPreviewPages > 0 && policy.MaxPreviewPages < totalPages 
                                      ? policy.MaxPreviewPages 
                                      : totalPages;

                    // 1. Cắt bớt trang nếu yêu cầu (Truncation)
                    if (pagesToKeep < totalPages)
                    {
                        for (int i = totalPages; i > pagesToKeep; i--)
                        {
                            pdfDoc.RemovePage(i);
                        }
                    }

                    // 2. Chèn Watermark (Đóng dấu bản quyền)
                    if (!string.IsNullOrEmpty(policy.WatermarkText))
                    {
                        string finalWatermark = policy.WatermarkText
                            .Replace("%Email%", userInfo)
                            .Replace("%Username%", userInfo)
                            .Replace("%Date%", DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"));

                        var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                        var gs = new PdfExtGState().SetFillOpacity(0.3f); // 30% opacity để in chìm

                        for (int i = 1; i <= pagesToKeep; i++)
                        {
                            var page = pdfDoc.GetPage(i);
                            var pageSize = page.GetPageSizeWithRotation();
                            var pdfCanvas = new PdfCanvas(page);
                            
                            pdfCanvas.SaveState();
                            pdfCanvas.SetExtGState(gs);

                            using (var canvas = new Canvas(pdfCanvas, pageSize))
                            {
                                var paragraph = new Paragraph(finalWatermark)
                                    .SetFont(font)
                                    .SetFontSize(48)
                                    .SetFontColor(ColorConstants.RED);

                                float x = (pageSize.GetLeft() + pageSize.GetRight()) / 2;
                                float y = (pageSize.GetTop() + pageSize.GetBottom()) / 2;
                                
                                // Căn giữa và xoay 45 độ (Pi/4)
                                canvas.ShowTextAligned(paragraph, x, y, i, TextAlignment.CENTER, VerticalAlignment.MIDDLE, (float)(Math.PI / 4));
                            }
                            
                            pdfCanvas.RestoreState();
                        }
                    }
                }
            }

            outStream.Position = 0;
            return await Task.FromResult(outStream);
        }
    }
}
