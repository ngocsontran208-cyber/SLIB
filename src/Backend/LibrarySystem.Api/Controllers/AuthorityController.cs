using Microsoft.AspNetCore.Mvc;
using LibrarySystem.Application.Interfaces;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/authorities")]
    public class AuthorityController : ControllerBase
    {
        private readonly IAuthorityService _authorityService;
        private readonly ISruClientService _sruClientService;

        public AuthorityController(IAuthorityService authorityService, ISruClientService sruClientService)
        {
            _authorityService = authorityService;
            _sruClientService = sruClientService;
        }

        [HttpGet("suggest")]
        public async Task<IActionResult> SuggestAuthorities([FromQuery] string q, [FromQuery] string type = "Personal Name")
        {
            var results = await _authorityService.SuggestAuthoritiesAsync(q, type);
            return Ok(results);
        }

        [HttpGet("sru-search")]
        public async Task<IActionResult> SruSearch([FromQuery] int targetId, [FromQuery] string query)
        {
            var fields = await _sruClientService.SearchAuthorityAsync(targetId, query);
            return Ok(fields);
        }
    }
}
