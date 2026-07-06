using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Librarian")] // Chỉ cho phép Thủ thư thực hiện mượn/trả
    public class LibrarianController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LibrarianController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class BorrowRequest
        {
            public int UserId { get; set; }
            public string Barcode { get; set; } = string.Empty;
        }

        [HttpPost("borrow")]
        public async Task<IActionResult> BorrowBook([FromBody] BorrowRequest request)
        {
            // 1. Kiểm tra giới hạn số sách tối đa
            var maxBooksPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "MaxBooksAllowed");
            int maxBooks = maxBooksPolicy != null ? int.Parse(maxBooksPolicy.PolicyValue) : 5;

            var currentLoans = await _context.BookLoans.CountAsync(l => l.UserId == request.UserId && l.Status == "Borrowed");
            if (currentLoans >= maxBooks)
            {
                return BadRequest($"User has reached the maximum allowed limit of {maxBooks} books.");
            }

            // 2. Tìm cuốn sách vật lý qua Barcode
            var physicalItem = await _context.PhysicalItems.FirstOrDefaultAsync(p => p.Barcode == request.Barcode);
            if (physicalItem == null) return NotFound("Book not found.");

            if (physicalItem.Status != "Available")
            {
                return BadRequest($"This book is currently {physicalItem.Status}.");
            }

            // 3. Thực hiện thay đổi trạng thái
            physicalItem.Status = "Borrowed";

            // 4. Tạo giao dịch mượn
            var maxDaysPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "MaxBorrowDays");
            int maxDays = maxDaysPolicy != null ? int.Parse(maxDaysPolicy.PolicyValue) : 14;

            var loan = new BookLoan
            {
                UserId = request.UserId,
                PhysicalItemId = physicalItem.Id,
                BorrowDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(maxDays),
                Status = "Borrowed"
            };

            _context.BookLoans.Add(loan);

            try
            {
                // Optimistic Concurrency sẽ được kích hoạt tại đây.
                // Nếu 2 request cùng sửa status cuốn sách này ở cùng 1 phần ngàn giây,
                // request thứ 2 sẽ bị văng lỗi DbUpdateConcurrencyException.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Trả về HTTP 409 Conflict thay vì 500
                return Conflict("Rất tiếc, cuốn sách này vừa được sinh viên khác mượn!");
            }

            return Ok(loan);
        }

        [HttpPost("return/{loanId}")]
        public async Task<IActionResult> ReturnBook(int loanId)
        {
            var loan = await _context.BookLoans
                .Include(l => l.PhysicalItem)
                .FirstOrDefaultAsync(l => l.Id == loanId);

            if (loan == null || loan.Status != "Borrowed") return BadRequest("Invalid loan record.");

            loan.ReturnDate = DateTime.Now;
            loan.Status = "Returned";
            loan.PhysicalItem.Status = "Available"; // Sách sẵn sàng trên kệ
            
            await _context.SaveChangesAsync();
            return Ok(loan);
        }
    }
}
