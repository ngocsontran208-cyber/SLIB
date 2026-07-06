using System.Threading.Tasks;
using System.Linq;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/admin/erm")]
    [Authorize(Roles = "Admin")]
    public class AdminErmController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminErmController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- VENDOR ENDPOINTS ---
        [HttpGet("vendors")]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _context.Vendors
                .Select(v => new { v.Id, v.Name, v.Code, v.IsActive })
                .ToListAsync();
            return Ok(vendors);
        }

        [HttpPost("vendors")]
        public async Task<IActionResult> CreateVendor([FromBody] Vendor request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Code))
                return BadRequest("Name and Code are required.");
                
            _context.Vendors.Add(request);
            await _context.SaveChangesAsync();
            return Ok(new { request.Id, request.Name, request.Code, request.IsActive });
        }

        // --- LICENSE & SUSHI ENDPOINTS ---
        [HttpGet("licenses")]
        public async Task<IActionResult> GetLicenses()
        {
            var licenses = await _context.ElectronicResourceLicenses
                .Include(l => l.Vendor)
                .Select(l => new {
                    l.Id,
                    l.ResourceName,
                    l.Cost,
                    l.ConcurrentUsers,
                    l.ValidFrom,
                    l.ValidTo,
                    l.SushiApiUrl,
                    l.SushiApiKey,
                    l.RequestorId,
                    VendorId = l.VendorId,
                    VendorName = l.Vendor.Name
                })
                .ToListAsync();
                
            return Ok(licenses);
        }

        [HttpPost("licenses")]
        public async Task<IActionResult> CreateLicense([FromBody] ElectronicResourceLicense request)
        {
            if (string.IsNullOrEmpty(request.ResourceName))
                return BadRequest("ResourceName is required.");

            // Kiểm tra Vendor tồn tại không
            var vendor = await _context.Vendors.FindAsync(request.VendorId);
            if (vendor == null)
                return BadRequest("Vendor ID not found.");

            _context.ElectronicResourceLicenses.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("licenses/{id}")]
        public async Task<IActionResult> UpdateLicense(int id, [FromBody] ElectronicResourceLicense request)
        {
            var license = await _context.ElectronicResourceLicenses.FindAsync(id);
            if (license == null)
                return NotFound("License not found.");

            license.ResourceName = request.ResourceName;
            license.VendorId = request.VendorId;
            license.Cost = request.Cost;
            license.ConcurrentUsers = request.ConcurrentUsers;
            license.ValidFrom = request.ValidFrom;
            license.ValidTo = request.ValidTo;
            license.SushiApiUrl = request.SushiApiUrl;
            license.SushiApiKey = request.SushiApiKey;
            license.RequestorId = request.RequestorId;

            await _context.SaveChangesAsync();
            return Ok(license);
        }

        [HttpDelete("licenses/{id}")]
        public async Task<IActionResult> DeleteLicense(int id)
        {
            var license = await _context.ElectronicResourceLicenses.FindAsync(id);
            if (license == null)
                return NotFound("License not found.");

            _context.ElectronicResourceLicenses.Remove(license);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
