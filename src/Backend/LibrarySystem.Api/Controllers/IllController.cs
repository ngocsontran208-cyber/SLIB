using LibrarySystem.Domain.Entities.Ill;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Librarian,Admin")]
    public class IllController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public IllController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests()
        {
            var requests = await _context.IllRequests
                .Include(r => r.Patron)
                .Include(r => r.Partner)
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();
            
            return Ok(requests);
        }

        public class UpdateStatusRequest
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpPatch("requests/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var illRequest = await _context.IllRequests
                .Include(r => r.Patron)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (illRequest == null) return NotFound();

            illRequest.Status = request.Status;
            await _context.SaveChangesAsync();

            // Nếu trạng thái chuyển thành Received, gửi thông báo cho Sinh viên ra lấy sách
            if (request.Status == "Received" && illRequest.Patron != null)
            {
                string message = $"Sách ILL '{illRequest.Title}' đã về tới thư viện. Vui lòng đến quầy mượn trả để nhận sách.";
                
                // Demo: Gửi thông báo SignalR (Trong thực tế nên target riêng userId)
                await _hubContext.Clients.All.SendAsync("ReceiveMessage", "System (ILL)", message);
                
                // Ở đây có thể tích hợp gửi Email qua SendGrid / SMTP
            }

            return Ok(illRequest);
        }
    }
}
