using LibrarySystem.Domain.Entities.Dam;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.DrmEngine;
using LibrarySystem.Infrastructure.Search;
using LibrarySystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/digital-asset")]
    public class DigitalAssetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDrmEngineService _drmEngine;
        private readonly IStorageService _storageService;
        private readonly IElasticsearchService _elasticsearchService;
        private readonly IMemoryCache _cache;

        public DigitalAssetController(
            ApplicationDbContext context, 
            IDrmEngineService drmEngine, 
            IStorageService storageService, 
            IElasticsearchService elasticsearchService,
            IMemoryCache cache)
        {
            _context = context;
            _drmEngine = drmEngine;
            _storageService = storageService;
            _elasticsearchService = elasticsearchService;
            _cache = cache;
        }


        #region DRM Policy (Admin)

        [HttpGet("drm-policies")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDrmPolicies()
        {
            if (!_cache.TryGetValue("DrmPolicies", out var policies))
            {
                policies = await _context.DrmPolicies.ToListAsync();
                _cache.Set("DrmPolicies", policies, TimeSpan.FromHours(1));
            }
            return Ok(policies);
        }

        [HttpPost("drm-policies")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDrmPolicy([FromBody] DrmPolicy policy)
        {
            _context.DrmPolicies.Add(policy);
            await _context.SaveChangesAsync();
            _cache.Remove("DrmPolicies");
            return CreatedAtAction(nameof(GetDrmPolicies), new { id = policy.Id }, policy);
        }

        [HttpPut("drm-policies/{id}")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDrmPolicy(int id, [FromBody] DrmPolicy policy)
        {
            if (id != policy.Id) return BadRequest();
            _context.Entry(policy).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _cache.Remove("DrmPolicies");
            return NoContent();
        }

        [HttpDelete("drm-policies/{id}")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDrmPolicy(int id)
        {
            var policy = await _context.DrmPolicies.FindAsync(id);
            if (policy == null) return NotFound();
            _context.DrmPolicies.Remove(policy);
            await _context.SaveChangesAsync();
            _cache.Remove("DrmPolicies");
            return NoContent();
        }

        #endregion

        #region Asset Management (Admin)

        [HttpGet]
        public async Task<IActionResult> GetDigitalAssets()
        {
            var assets = await _context.DigitalAssets
                .Include(a => a.BibliographicRecord)
                .Select(a => new
                {
                    a.Id,
                    Title = a.BibliographicRecord != null ? a.BibliographicRecord.Title : a.Title,
                    Author = a.BibliographicRecord != null ? a.BibliographicRecord.Author : "",
                    a.MimeType,
                    a.FileSize,
                    a.CreatedAt
                })
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(assets);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchAssets([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return BadRequest("Vui lòng nhập từ khóa");
            
            var results = await _elasticsearchService.SearchDigitalAssetAsync(q);
            return Ok(results);
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterMetadata([FromBody] RegisterAssetMetadataRequest request)
        {
            var assets = await _context.DigitalAssets
                .Where(a => request.AssetIds.Contains(a.Id))
                .ToListAsync();

            var bibRecordExists = await _context.BibliographicRecords.AnyAsync(r => r.Id == request.BibliographicRecordId);
            if (!bibRecordExists)
            {
                return BadRequest("Biểu ghi thư mục không tồn tại.");
            }

            foreach (var asset in assets)
            {
                asset.DrmPolicyId = request.DrmPolicyId;
                asset.BibliographicRecordId = request.BibliographicRecordId;
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Linked to Bibliographic Record and DRM Policy saved successfully." });
        }

        public class RegisterAssetMetadataRequest
        {
            public List<int> AssetIds { get; set; } = new List<int>();
            public int DrmPolicyId { get; set; }
            public int BibliographicRecordId { get; set; }
        }

        #endregion

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

            // Ghi Log truy cập
            var log = new AssetAccessLog
            {
                DigitalAssetId = assetId,
                UserEmail = userEmail,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                Device = HttpContext.Request.Headers["User-Agent"].ToString(),
                AccessType = "Render",
                AccessedAt = DateTime.UtcNow
            };
            _context.AssetAccessLogs.Add(log);
            await _context.SaveChangesAsync();

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
            surface.Canvas.DrawText("DUMMY PDF PAGE", 150, 250, SkiaSharp.SKTextAlign.Left, font, paint);
            
            using var image = surface.Snapshot();
            using var data = image.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        #region DRM Streaming

        [HttpGet("stream/{id}")]
        // [Authorize] // Bật xác thực trong thực tế
        public async Task<IActionResult> StreamAsset(int id, [FromQuery] string email = "guest@university.edu")
        {
            // 1. Lấy thông tin Asset và Policy
            var asset = await _context.DigitalAssets
                .Include(a => a.DrmPolicy)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asset == null) return NotFound("Asset not found");
            
            // 2. Kiểm tra quyền truy cập (Giả lập)
            // if (!User.Identity.IsAuthenticated) return Unauthorized();
            
            // 3. Lấy file vật lý từ Storage Service
            var fileStream = await _storageService.GetFileStreamAsync(asset.FilePath);
            if (fileStream == null) return NotFound("Physical file not found");

            var policy = asset.DrmPolicy ?? new DrmPolicy();

            // Ghi Log truy cập
            var log = new AssetAccessLog
            {
                DigitalAssetId = id,
                UserEmail = email,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                Device = HttpContext.Request.Headers["User-Agent"].ToString(),
                AccessType = "Stream",
                AccessedAt = DateTime.UtcNow
            };
            _context.AssetAccessLogs.Add(log);
            await _context.SaveChangesAsync();

            // 4. Phân nhánh xử lý theo định dạng File
            if (asset.MimeType.Contains("pdf", StringComparison.OrdinalIgnoreCase))
            {
                // PDF: Bắn qua DrmEngineService để đóng dấu Watermark và cắt trang
                var processedStream = await _drmEngine.ProcessPdfStreamAsync(fileStream, policy, email);
                return File(processedStream, asset.MimeType);
            }
            else if (asset.MimeType.Contains("video") || asset.MimeType.Contains("audio"))
            {
                // Video/Audio: Không cần đóng dấu chữ (thường đóng dấu mềm trên Frontend hoặc FFmpeg)
                // Hỗ trợ HTTP 206 Partial Content (Byte-Range) cực kỳ mượt mà
                return File(fileStream, asset.MimeType, enableRangeProcessing: true);
            }

            // Các file khác (Zip, Docx...): Tải thẳng (có thể check Policy AllowDownload)
            if (!policy.AllowDownload) return Forbid("Tài liệu này không cho phép tải về.");
            
            return File(fileStream, asset.MimeType);
        }

        #endregion
    }
}
