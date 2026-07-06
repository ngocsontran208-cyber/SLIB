using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Librarian")]
    public class VendorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VendorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _context.Vendors.ToListAsync();
            return Ok(vendors);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVendor([FromBody] Vendor vendor)
        {
            if (vendor == null) return BadRequest();
            _context.Vendors.Add(vendor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetVendors), new { id = vendor.Id }, vendor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVendor(int id, [FromBody] Vendor updatedVendor)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null) return NotFound();

            vendor.Name = updatedVendor.Name;
            vendor.Code = updatedVendor.Code;
            vendor.Email = updatedVendor.Email;
            vendor.ContactPerson = updatedVendor.ContactPerson;
            vendor.IsActive = updatedVendor.IsActive;

            await _context.SaveChangesAsync();
            return Ok(vendor);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null) return NotFound();

            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
