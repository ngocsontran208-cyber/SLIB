using LibrarySystem.Application.Interfaces;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.Search;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace LibrarySystem.Worker.Jobs
{
    public class SearchIndexingJob : ISearchIndexerJob
    {
        private readonly ApplicationDbContext _context;
        private readonly IElasticsearchService _elasticService;

        public SearchIndexingJob(ApplicationDbContext context, IElasticsearchService elasticService)
        {
            _context = context;
            _elasticService = elasticService;
        }

        public async Task SyncToElasticAsync(int catalogId)
        {
            Console.WriteLine($"[{DateTime.Now}] Starting Indexing Job for Catalog ID: {catalogId}");

            var catalog = await _context.Catalogs.FirstOrDefaultAsync(c => c.Id == catalogId);
            if (catalog == null)
            {
                Console.WriteLine($"Catalog {catalogId} not found.");
                return;
            }

            // Đẩy lên Elasticsearch
            var success = await _elasticService.IndexCatalogAsync(catalog);

            if (success)
                Console.WriteLine($"Catalog {catalog.Title} successfully indexed to Elasticsearch.");
            else
                Console.WriteLine($"Failed to index Catalog {catalog.Title}.");
        }
    }
}
