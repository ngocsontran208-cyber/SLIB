using Elastic.Clients.Elasticsearch;
using LibrarySystem.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly LibrarySystem.Infrastructure.Search.IElasticsearchService _searchService;

        public SearchController(LibrarySystem.Infrastructure.Search.IElasticsearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("Query parameter 'q' is required.");
            }

            // Fuzzy Search trên Title hoặc Author
            var documents = await _searchService.SearchCatalogAsync(q);

            return Ok(documents);
        }
    }
}
