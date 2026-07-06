using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LibrarySystem.Worker.Jobs
{
    public class FineCalculationJob
    {
        private readonly ApplicationDbContext _context;

        public FineCalculationJob(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task ExecuteAsync()
        {
            Console.WriteLine($"[{DateTime.Now}] Starting Fine Calculation Job...");

            // 1. Lấy mức phạt động từ cấu hình
            var finePolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "DailyFineAmount");
            decimal dailyFine = finePolicy != null ? decimal.Parse(finePolicy.PolicyValue) : 5000;

            // 2. Tìm tất cả các sách chưa trả và đã quá hạn
            var overdueLoans = await _context.BookLoans
                .Where(l => l.Status == "Borrowed" && l.DueDate < DateTime.Now)
                .ToListAsync();

            if (!overdueLoans.Any())
            {
                Console.WriteLine("No overdue books found.");
                return;
            }

            // 3. Tính tiền phạt và cập nhật
            foreach (var loan in overdueLoans)
            {
                var overdueDays = (DateTime.Now.Date - loan.DueDate.Date).Days;
                if (overdueDays > 0)
                {
                    loan.FineAmount = overdueDays * dailyFine;
                    loan.Status = "Overdue";
                    Console.WriteLine($"Loan {loan.Id} is overdue by {overdueDays} days. Fine: {loan.FineAmount}");
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("Fine Calculation Job Completed.");
        }
    }
}
