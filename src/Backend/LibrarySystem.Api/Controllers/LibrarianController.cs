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
        private readonly LibrarySystem.Application.Interfaces.IPhysicalItemService _physicalItemService;

        public LibrarianController(ApplicationDbContext context, LibrarySystem.Application.Interfaces.IPhysicalItemService physicalItemService)
        {
            _context = context;
            _physicalItemService = physicalItemService;
        }

        public class BorrowRequest
        {
            public int UserId { get; set; }
            public string Barcode { get; set; } = string.Empty;
        }

        [HttpPost("borrow")]
        public async Task<IActionResult> BorrowBook([FromBody] BorrowRequest request)
        {
            try
            {
                var physicalItem = await _context.PhysicalItems.FirstOrDefaultAsync(p => p.Barcode == request.Barcode);
                if (physicalItem == null) return NotFound("Book not found.");

                var loan = await _physicalItemService.CheckOutAsync(physicalItem.Id, request.UserId);
                return Ok(loan);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("Rất tiếc, cuốn sách này vừa được sinh viên khác mượn!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
