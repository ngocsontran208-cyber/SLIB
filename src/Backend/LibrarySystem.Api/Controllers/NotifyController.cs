using LibrarySystem.Api.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/internal/[controller]")]
    // Lưu ý: Trong thực tế cần có xác thực API Key nội bộ ở đây
    public class NotifyController : ControllerBase
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotifyController(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public class NotificationRequest
        {
            public int UserId { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
        {
            // Bắn tín hiệu SignalR cho tất cả Client (Demo)
            // Trong thực tế, nên dùng Clients.User(request.UserId.ToString())
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "System", request.Message);
            return Ok();
        }
    }
}
