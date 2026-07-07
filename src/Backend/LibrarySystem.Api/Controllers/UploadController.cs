using LibrarySystem.Api.Helpers;
using LibrarySystem.Api.Services;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities.Dam;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly RabbitMqProducer _producer;
        private readonly IStorageService _storageService;
        private readonly ApplicationDbContext _context;

        // Lưu trữ tạm Session Upload trong bộ nhớ (Production nên dùng Redis/DB)
        private static readonly ConcurrentDictionary<string, UploadSession> _uploadSessions = new();

        public UploadController(RabbitMqProducer producer, IStorageService storageService, ApplicationDbContext context)
        {
            _producer = producer;
            _storageService = storageService;
            _context = context;
        }

        public class InitUploadRequest
        {
            public string FileName { get; set; } = string.Empty;
            public long TotalSize { get; set; }
            public string ContentType { get; set; } = string.Empty;
        }

        public class UploadSession
        {
            public string SessionId { get; set; } = string.Empty;
            public string FileName { get; set; } = string.Empty;
            public string ContentType { get; set; } = string.Empty;
            public long TotalSize { get; set; }
            public string TempFilePath { get; set; } = string.Empty;
        }

        [HttpPost("init")]
        public IActionResult InitUpload([FromBody] InitUploadRequest request)
        {
            var sessionId = Guid.NewGuid().ToString();
            var tempFolder = Path.Combine(Path.GetTempPath(), "slib_uploads");
            if (!Directory.Exists(tempFolder)) Directory.CreateDirectory(tempFolder);

            var tempFilePath = Path.Combine(tempFolder, $"{sessionId}_{request.FileName}");

            var session = new UploadSession
            {
                SessionId = sessionId,
                FileName = request.FileName,
                ContentType = request.ContentType,
                TotalSize = request.TotalSize,
                TempFilePath = tempFilePath
            };

            _uploadSessions.TryAdd(sessionId, session);

            return Ok(new { SessionId = sessionId });
        }

        [HttpPost("chunk")]
        public async Task<IActionResult> UploadChunk([FromForm] string sessionId, [FromForm] int chunkIndex, IFormFile file)
        {
            if (!_uploadSessions.TryGetValue(sessionId, out var session))
                return BadRequest("Invalid or expired SessionId");

            if (file == null || file.Length == 0) return BadRequest("Empty chunk.");

            // Ghi append chunk vào file tạm
            using (var stream = new FileStream(session.TempFilePath, FileMode.Append, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { Message = "Chunk uploaded successfully." });
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteUpload([FromForm] string sessionId)
        {
            if (!_uploadSessions.TryGetValue(sessionId, out var session))
                return BadRequest("Invalid SessionId");

            if (!System.IO.File.Exists(session.TempFilePath))
                return BadRequest("Temp file not found.");

            // 1. Kiểm tra toàn vẹn File Size
            var fileInfo = new FileInfo(session.TempFilePath);
            if (fileInfo.Length != session.TotalSize)
            {
                System.IO.File.Delete(session.TempFilePath);
                _uploadSessions.TryRemove(sessionId, out _);
                return BadRequest("File size mismatch. Upload might be corrupted.");
            }

            // 2. Security Validation: Magic Bytes
            var extension = Path.GetExtension(session.FileName);
            if (!FileValidationHelper.IsValidSignature(session.TempFilePath, extension))
            {
                System.IO.File.Delete(session.TempFilePath);
                _uploadSessions.TryRemove(sessionId, out _);
                return BadRequest("Security Error: MimeType mismatch or Malicious file detected.");
            }

            // 3. Tính mã SHA-256 (Checksum)
            string checksum;
            using (var sha256 = SHA256.Create())
            {
                using (var stream = System.IO.File.OpenRead(session.TempFilePath))
                {
                    var hashBytes = await sha256.ComputeHashAsync(stream);
                    checksum = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
                }
            }
            
            // 4. Đẩy qua StorageService (SqlFileStream hoặc Local)
            var finalPath = await _storageService.SaveFileAsync(session.TempFilePath, session.FileName, session.ContentType);

            // 5. Lưu Database lấy AssetId
            var asset = new DigitalAsset
            {
                Title = session.FileName,
                FilePath = finalPath,
                FileSize = session.TotalSize,
                MimeType = session.ContentType,
                Checksum = checksum,
                CreatedAt = DateTime.UtcNow
            };
            _context.DigitalAssets.Add(asset);
            await _context.SaveChangesAsync();

            // 6. Kích hoạt Background Worker qua RabbitMQ
            await _producer.SendAssetProcessingEventAsync(asset.Id);

            _uploadSessions.TryRemove(sessionId, out _);

            return Ok(new 
            { 
                Message = "Upload hoàn tất.", 
                AssetId = asset.Id,
                FilePath = finalPath, 
                Checksum = checksum 
            });
        }
    }
}
