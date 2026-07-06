using System;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/items")]
    [Authorize(Roles = "Librarian,Admin")]
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ItemController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CreateItemRequest
        {
            public int BibliographicRecordId { get; set; }
            public string Barcode { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> RegisterItem([FromBody] CreateItemRequest request)
        {
            if (string.IsNullOrEmpty(request.Barcode))
                return BadRequest("Barcode is required.");

            // Check if record exists
            var recordExists = await _context.BibliographicRecords.AnyAsync(r => r.Id == request.BibliographicRecordId);
            if (!recordExists)
                return NotFound("Bibliographic Record not found.");

            // Check if barcode is unique
            var barcodeExists = await _context.PhysicalItems.AnyAsync(i => i.Barcode == request.Barcode);
            if (barcodeExists)
                return BadRequest("Barcode already exists in the system.");

            var item = new PhysicalItem
            {
                BibliographicRecordId = request.BibliographicRecordId,
                Barcode = request.Barcode,
                Status = "Available"
            };

            _context.PhysicalItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(item);
        }

        [HttpGet("record/{recordId}")]
        public async Task<IActionResult> GetItemsByRecord(int recordId)
        {
            var items = await _context.PhysicalItems
                .Where(i => i.BibliographicRecordId == recordId)
                .Select(i => new {
                    i.Id,
                    i.Barcode,
                    i.Status
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.PhysicalItems.FindAsync(id);
            if (item == null) return NotFound();

            // Prevent deletion if it has loans
            var hasLoans = await _context.BookLoans.AnyAsync(l => l.PhysicalItemId == id);
            if (hasLoans)
                return BadRequest("Cannot delete item because it has circulation history.");

            _context.PhysicalItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
