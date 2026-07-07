using LibrarySystem.Domain.Entities.Inventory;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Librarian,Admin")]
    public class InventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public InventoryController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var sessions = await _context.StocktakeSessions
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
            return Ok(sessions);
        }

        public class CreateSessionRequest
        {
            public string Name { get; set; } = string.Empty;
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
        {
            var session = new StocktakeSession
            {
                Name = request.Name,
                CreatedBy = User.Identity?.Name ?? "Unknown"
            };

            _context.StocktakeSessions.Add(session);
            await _context.SaveChangesAsync();
            return Ok(session);
        }

        public class ScanRequest
        {
            public int SessionId { get; set; }
            public string Barcode { get; set; } = string.Empty;
        }

        [HttpPost("scan")]
        public async Task<IActionResult> ProcessScan([FromBody] ScanRequest request)
        {
            var session = await _context.StocktakeSessions.FindAsync(request.SessionId);
            if (session == null || session.Status != "InProgress")
                return BadRequest("Phiên kiểm kê không tồn tại hoặc đã kết thúc.");

            var item = await _context.PhysicalItems
                .Include(p => p.BibliographicRecord)
                .FirstOrDefaultAsync(p => p.Barcode == request.Barcode);

            if (item == null)
                return NotFound($"Barcode {request.Barcode} not found in system.");

            // 1. Phân loại màu sắc theo Business Logic
            string resultColor = "Green";
            if (item.Status == "Available")
            {
                resultColor = "Green"; // Đúng vị trí
            }
            else if (item.Status == "Borrowed" || item.Status == "Lost")
            {
                resultColor = "Red"; // Đáng lẽ không có trên kệ, nhưng lại quét thấy
            }
            else if (item.Status == "Transit" || item.Status == "Damaged")
            {
                resultColor = "Yellow"; // Nằm sai vị trí phân loại hoặc đang luân chuyển
            }

            var scan = new StocktakeScan
            {
                SessionId = request.SessionId,
                PhysicalItemId = item.Id,
                ExpectedStatus = item.Status,
                ResultColor = resultColor,
                ScannedAt = DateTime.UtcNow
            };

            _context.StocktakeScans.Add(scan);
            await _context.SaveChangesAsync();

            // 2. Chuẩn bị payload để đẩy qua SignalR
            var resultPayload = new
            {
                scan.Id,
                scan.SessionId,
                scan.ScannedAt,
                scan.ExpectedStatus,
                scan.ResultColor,
                PhysicalItem = new 
                {
                    item.Id,
                    item.Barcode,
                    item.Status,
                    Title = item.BibliographicRecord?.Title
                }
            };

            // 3. Đẩy Realtime tới Frontend
            await _hubContext.Clients.All.SendAsync("ReceiveInventoryScan", resultPayload);

            return Ok(resultPayload);
        }
    }
}
