using System;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Erm
{
    public class ErmService : IErmService
    {
        private readonly ApplicationDbContext _context;

        public ErmService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateCostPerUseAsync(int licenseId, int year)
        {
            var license = await _context.ElectronicResourceLicenses
                .Include(l => l.CounterStatistics)
                .FirstOrDefaultAsync(l => l.Id == licenseId);

            if (license == null)
            {
                throw new Exception("License not found.");
            }

            // Tổng lượt tải bài báo thành công trong năm
            var totalSuccessfulRequests = license.CounterStatistics
                .Where(c => c.ReportingMonth.Year == year)
                .Sum(c => c.SuccessfulArticleRequests);

            if (totalSuccessfulRequests == 0)
            {
                return 0; // Tránh chia cho 0. Nếu không ai tải, Cost-Per-Use không xác định hoặc trả về 0.
            }

            // Cost-Per-Use = Ngân sách / Tổng số lượt sử dụng
            return license.Cost / totalSuccessfulRequests;
        }
    }
}
