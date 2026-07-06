using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.DrmEngine;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] - Yêu cầu đăng nhập để truy cập tài nguyên số
    public class DigitalAssetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDrmEngineService _drmEngine;

        public DigitalAssetController(ApplicationDbContext context, IDrmEngineService drmEngine)
        {
            _context = context;
            _drmEngine = drmEngine;
        }

        // Bỏ qua xác thực cho mục đích demo (sẽ thay bằng User.Identity.Name)
        [HttpGet("render-page/{assetId}")]
        [EnableRateLimiting("DrmPolicy")]
        public async Task<IActionResult> RenderProtectedPage(int assetId, [FromQuery] int userId)
        {
            // 1. Kiểm tra giới hạn lượt xem (DRM Policy)
            var maxViewPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "MaxPdfViewCount");
            int maxViews = maxViewPolicy != null ? int.Parse(maxViewPolicy.PolicyValue) : 10;

            // Chú ý: Cần thêm bảng AssetAccessLog để đếm chính xác số lần sinh viên đã xem. 
            // Demo: Giả sử sinh viên hợp lệ.
            
            // 2. Lấy Watermark Template từ cấu hình động
            var watermarkPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "DrmWatermarkTemplate");
            string template = watermarkPolicy?.PolicyValue ?? "CONFIDENTIAL - %Email%";

            // Lấy email người dùng từ bảng User (hoặc JWT)
            var user = await _context.Users.FindAsync(userId);
            string userEmail = user?.Email ?? "guest@university.edu";

            // 3. Render file PDF sang ảnh và đóng dấu Watermark
            // Trong thực tế, hệ thống sẽ đọc byte[] từ asset.FileData.
            // Để demo API không bị lỗi khi chưa có file, chúng ta tạo một mảng byte ảnh giả.
            byte[] dummyPdfPage = CreateDummyImage(); 

            byte[] protectedImage = _drmEngine.ApplyDynamicWatermark(dummyPdfPage, userEmail, template);

            // 4. Trả về Image Blob thẳng xuống RAM của trình duyệt (Frontend)
            return File(protectedImage, "image/png");
        }

        private byte[] CreateDummyImage()
        {
            // Trả về một mảng byte ảnh trắng 500x500
            using var surface = SkiaSharp.SKSurface.Create(new SkiaSharp.SKImageInfo(500, 500));
            surface.Canvas.Clear(SkiaSharp.SKColors.White);
            using var font = new SkiaSharp.SKFont(SkiaSharp.SKTypeface.Default, 24);
            using var paint = new SkiaSharp.SKPaint { Color = SkiaSharp.SKColors.Black };
            surface.Canvas.DrawText("DUMMY PDF PAGE", 150, 250, font, paint);
            
            using var image = surface.Snapshot();
            using var data = image.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }
    }
}
