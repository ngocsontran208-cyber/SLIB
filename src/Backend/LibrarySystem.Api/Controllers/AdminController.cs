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
    [Authorize(Roles = "Admin")] // Chặn tất cả ngoại trừ Admin
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("policies")]
        public async Task<IActionResult> GetPolicies()
        {
            var policies = await _context.LibraryPolicies.ToListAsync();
            return Ok(policies);
        }

        [HttpPut("policies/{key}")]
        public async Task<IActionResult> UpdatePolicy(string key, [FromBody] string newValue)
        {
            var policy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == key);
            if (policy == null)
            {
                policy = new Policy
                {
                    PolicyKey = key,
                    PolicyValue = newValue,
                    UpdatedAt = DateTime.Now,
                    UpdatedBy = User.Identity?.Name ?? "Admin"
                };
                _context.LibraryPolicies.Add(policy);
            }
            else
            {
                policy.PolicyValue = newValue;
                policy.UpdatedAt = DateTime.Now;
                policy.UpdatedBy = User.Identity?.Name ?? "Admin";
            }

            await _context.SaveChangesAsync();
            return Ok(policy);
        }
    }
}
