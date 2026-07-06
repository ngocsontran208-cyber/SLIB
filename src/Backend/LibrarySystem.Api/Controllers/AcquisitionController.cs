using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LibrarySystem.Infrastructure.Data;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/acquisition")]
    [Authorize(Roles = "Admin,Librarian")]
    public class AcquisitionController : ControllerBase
    {
        private readonly IAcquisitionService _acquisitionService;
        private readonly ApplicationDbContext _context;

        public AcquisitionController(IAcquisitionService acquisitionService, ApplicationDbContext context)
        {
            _acquisitionService = acquisitionService;
            _context = context;
        }

        [HttpGet("purchase-orders")]
        public async Task<IActionResult> GetPurchaseOrders()
        {
            var pos = await _context.PurchaseOrders
                .Include(po => po.Vendor)
                .Include(po => po.OrderLines)
                .ToListAsync();
            return Ok(pos);
        }

        [HttpPost("purchase-orders")]
        public async Task<IActionResult> CreatePurchaseOrder([FromBody] PurchaseOrder po)
        {
            if (po == null) return BadRequest();
            po.CreatedAt = System.DateTime.UtcNow;
            po.CreatedBy = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
            
            _context.PurchaseOrders.Add(po);
            await _context.SaveChangesAsync();
            return Ok(po);
        }

        [HttpPost("purchase-orders/lines")]
        public async Task<IActionResult> CreatePurchaseOrderLine([FromBody] PurchaseOrderLine pol)
        {
            if (pol == null) return BadRequest();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
            var createdPol = await _acquisitionService.CreatePurchaseOrderLineAsync(pol, userId);
            
            return Ok(createdPol);
        }
    }
}
