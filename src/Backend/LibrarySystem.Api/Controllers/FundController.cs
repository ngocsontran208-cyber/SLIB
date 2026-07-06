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
    public class FundController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FundController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFunds()
        {
            var funds = await _context.Funds.ToListAsync();
            return Ok(funds);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFund([FromBody] Fund fund)
        {
            if (fund == null) return BadRequest();
            _context.Funds.Add(fund);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFunds), new { id = fund.Id }, fund);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFund(int id, [FromBody] Fund updatedFund)
        {
            var fund = await _context.Funds.FindAsync(id);
            if (fund == null) return NotFound();

            fund.Name = updatedFund.Name;
            fund.Code = updatedFund.Code;
            fund.TotalBudget = updatedFund.TotalBudget;
            // CommittedAmount and SpentAmount should technically be updated via transactions/orders, 
            // but we expose it here for manual adjustments if needed by Admin.
            fund.CommittedAmount = updatedFund.CommittedAmount;
            fund.SpentAmount = updatedFund.SpentAmount;

            await _context.SaveChangesAsync();
            return Ok(fund);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFund(int id)
        {
            var fund = await _context.Funds.Include(f => f.PurchaseOrderLines).FirstOrDefaultAsync(f => f.Id == id);
            if (fund == null) return NotFound();
            
            if (fund.PurchaseOrderLines.Count > 0)
            {
                return BadRequest("Cannot delete fund because it has associated purchase order lines.");
            }

            _context.Funds.Remove(fund);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
