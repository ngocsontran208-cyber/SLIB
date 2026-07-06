using LibrarySystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Librarian,Admin")]
    public class UploadController : ControllerBase
    {
        private readonly RabbitMqProducer _producer;

        public UploadController(RabbitMqProducer producer)
        {
            _producer = producer;
        }

        [HttpPost("document")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromForm] int catalogId, [FromForm] int userId)
        {
            if (file == null || file.Length == 0) return BadRequest("File is empty.");

            // Lưu file tạm thời
            var tempPath = Path.GetTempFileName();
            using (var stream = new FileStream(tempPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Gửi message qua RabbitMQ
            await _producer.SendFileUploadedEventAsync(catalogId, tempPath, userId);

            // Trả về ngay 202 Accepted
            return Accepted(new { Message = "Tài liệu đang được xử lý ở nền, vui lòng chờ thông báo." });
        }
    }
}
