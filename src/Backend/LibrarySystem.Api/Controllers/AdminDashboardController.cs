using System.Threading.Tasks;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalRecords = await _context.BibliographicRecords.CountAsync();
            var totalLicenses = await _context.ElectronicResourceLicenses.CountAsync();
            var activeSip2 = await _context.Sip2Devices.CountAsync(d => d.IsActive);
            
            // Lấy lượng user online từ SignalR (tạm mô phỏng random hoặc fix cứng vì cần tracking kết nối)
            // Lấy dữ liệu Counter (ERM)
            var totalSearches = await _context.CounterStatistics.SumAsync(c => c.TotalRequests);
            var totalDownloads = await _context.CounterStatistics.SumAsync(c => c.SuccessfulArticleRequests);

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalRecords = totalRecords,
                TotalLicenses = totalLicenses,
                ActiveSip2Devices = activeSip2,
                ErmTotalSearches = totalSearches,
                ErmTotalDownloads = totalDownloads
            });
        }
    }
}
