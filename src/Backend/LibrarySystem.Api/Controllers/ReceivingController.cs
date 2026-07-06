using System.Security.Claims;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/receiving")]
    [Authorize(Roles = "Librarian")]
    public class ReceivingController : ControllerBase
    {
        private readonly IReceivingService _receivingService;

        public ReceivingController(IReceivingService receivingService)
        {
            _receivingService = receivingService;
        }

        public class ReceiveRequest
        {
            public int PieceId { get; set; }
        }

        [HttpPost("receive-piece")]
        public async Task<IActionResult> ReceivePiece([FromBody] ReceiveRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
            var success = await _receivingService.ReceivePieceAsync(request.PieceId, userId);

            if (!success)
                return BadRequest("Unable to receive piece. It might already be received or does not exist.");

            return Ok(new { Message = "Piece received successfully and added to Circulation." });
        }
    }
}
