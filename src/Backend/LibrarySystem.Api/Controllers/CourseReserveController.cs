using LibrarySystem.Domain.Entities.CourseReserves;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Librarian,Admin")]
    public class CourseReserveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CourseReserveController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.ReserveLists)
                    .ThenInclude(l => l.Items)
                        .ThenInclude(i => i.PhysicalItem)
                            .ThenInclude(p => p.BibliographicRecord)
                .ToListAsync();
            
            return Ok(courses);
        }

        public class AddItemRequest
        {
            public int CourseReserveListId { get; set; }
            public int PhysicalItemId { get; set; }
            public string ReservePolicy { get; set; } = "2 Hours";
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItemToReserveList([FromBody] AddItemRequest request)
        {
            var exists = await _context.CourseReserveItems.AnyAsync(
                i => i.CourseReserveListId == request.CourseReserveListId && i.PhysicalItemId == request.PhysicalItemId);
            
            if (exists)
                return BadRequest("Item is already in this reserve list.");

            var item = new CourseReserveItem
            {
                CourseReserveListId = request.CourseReserveListId,
                PhysicalItemId = request.PhysicalItemId,
                ReservePolicy = request.ReservePolicy
            };

            _context.CourseReserveItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(item);
        }

        [HttpDelete("items/{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            var item = await _context.CourseReserveItems.FindAsync(id);
            if (item == null) return NotFound();

            _context.CourseReserveItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
