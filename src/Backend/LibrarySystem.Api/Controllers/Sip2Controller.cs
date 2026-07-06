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
    [Route("api/admin/sip2")]
    [Authorize(Roles = "Admin")]
    public class Sip2Controller : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public Sip2Controller(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices()
        {
            var devices = await _context.Sip2Devices.ToListAsync();
            return Ok(devices);
        }

        [HttpPost("devices")]
        public async Task<IActionResult> CreateDevice([FromBody] Sip2Device request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.IpAddress))
                return BadRequest("Name and IP Address are required.");

            _context.Sip2Devices.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("devices/{id}")]
        public async Task<IActionResult> UpdateDevice(int id, [FromBody] Sip2Device request)
        {
            var device = await _context.Sip2Devices.FindAsync(id);
            if (device == null)
                return NotFound("Device not found.");

            device.Name = request.Name;
            device.IpAddress = request.IpAddress;
            device.Port = request.Port;
            device.Location = request.Location;
            device.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(device);
        }

        [HttpDelete("devices/{id}")]
        public async Task<IActionResult> DeleteDevice(int id)
        {
            var device = await _context.Sip2Devices.FindAsync(id);
            if (device == null)
                return NotFound("Device not found.");

            _context.Sip2Devices.Remove(device);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
