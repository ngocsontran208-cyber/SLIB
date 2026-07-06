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
    [Route("api/admin/drm")]
    [Authorize(Roles = "Admin")] // Chặn tất cả ngoại trừ Admin
    public class AdminDrmController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminDrmController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("policies")]
        public async Task<IActionResult> GetDrmPolicies()
        {
            var policies = await _context.LibraryPolicies
                .Where(p => p.PolicyKey.Contains("Drm") || p.PolicyKey.Contains("Pdf"))
                .ToListAsync();
            return Ok(policies);
        }

        [HttpPut("policies/{key}")]
        public async Task<IActionResult> UpdateDrmPolicy(string key, [FromBody] string newValue)
        {
            var policy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == key);
            if (policy == null) return NotFound("DRM Policy not found.");

            policy.PolicyValue = newValue;
            policy.UpdatedAt = DateTime.Now;
            policy.UpdatedBy = User.Identity?.Name ?? "Admin";

            await _context.SaveChangesAsync();
            return Ok(policy);
        }
    }
}
