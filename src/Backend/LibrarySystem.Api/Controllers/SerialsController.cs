using Microsoft.AspNetCore.Mvc;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/serials")]
    public class SerialsController : ControllerBase
    {
        private readonly ISerialsService _serialsService;

        public SerialsController(ISerialsService serialsService)
        {
            _serialsService = serialsService;
        }

        [HttpPost("subscriptions")]
        public async Task<IActionResult> CreateSubscription([FromBody] SerialSubscription subscription)
        {
            var result = await _serialsService.CreateSubscriptionAsync(subscription);
            return Ok(result);
        }

        [HttpPost("subscriptions/{id}/predict")]
        public async Task<IActionResult> PredictIssues(int id)
        {
            var issues = await _serialsService.PredictIssuesAsync(id);
            return Ok(issues);
        }

        [HttpGet("issues")]
        public async Task<IActionResult> GetExpectedIssues([FromQuery] int? subscriptionId)
        {
            var issues = await _serialsService.GetExpectedIssuesAsync(subscriptionId);
            return Ok(issues);
        }

        [HttpPost("issues/{id}/checkin")]
        public async Task<IActionResult> CheckInIssue(int id, [FromQuery] string? barcode)
        {
            var item = await _serialsService.CheckInIssueAsync(id, barcode);
            return Ok(item);
        }
    }
}
