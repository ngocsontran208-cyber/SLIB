using Hangfire;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Librarian,Admin")]
    public class CatalogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public CatalogController(ApplicationDbContext context, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _backgroundJobClient = backgroundJobClient;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCatalog([FromBody] Catalog catalog)
        {
            // 1. Lưu vào SQL Server
            _context.Catalogs.Add(catalog);
            await _context.SaveChangesAsync();

            // 2. Bắn sự kiện sang Worker (Hangfire) để đẩy lên Elasticsearch
            _backgroundJobClient.Enqueue<ISearchIndexerJob>(x => x.SyncToElasticAsync(catalog.Id));

            // 3. Trả về ngay lập tức (Không cần đợi Elasticsearch)
            return CreatedAtAction(nameof(GetCatalog), new { id = catalog.Id }, catalog);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCatalog(int id)
        {
            var catalog = await _context.Catalogs.FindAsync(id);
            if (catalog == null) return NotFound();
            return Ok(catalog);
        }
    }
}
