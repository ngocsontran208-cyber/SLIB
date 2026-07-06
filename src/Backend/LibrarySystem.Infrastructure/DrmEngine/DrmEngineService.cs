using SkiaSharp;
using System;
using System.IO;

namespace LibrarySystem.Infrastructure.DrmEngine
{
    public interface IDrmEngineService
    {
        byte[] ApplyDynamicWatermark(byte[] pdfPageImage, string userEmail, string watermarkTemplate);
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
    }
}
