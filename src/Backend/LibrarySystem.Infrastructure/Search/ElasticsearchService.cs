using Elastic.Clients.Elasticsearch;
using LibrarySystem.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace LibrarySystem.Infrastructure.Search
{
    public interface IElasticsearchService
    {
        Task<bool> IndexCatalogAsync(Catalog catalog);
        Task<System.Collections.Generic.IEnumerable<Catalog>> SearchCatalogAsync(string keyword);
    }

    public class ElasticsearchService : IElasticsearchService
    {
        private readonly ElasticsearchClient _client;
        private readonly string _defaultIndex;

        public ElasticsearchService(IConfiguration configuration)
        {
            var url = configuration["Elasticsearch:Url"] ?? "http://localhost:9200";
            _defaultIndex = configuration["Elasticsearch:DefaultIndex"] ?? "catalogs";
            
            var settings = new ElasticsearchClientSettings(new Uri(url))
                .DefaultIndex(_defaultIndex);
                
            _client = new ElasticsearchClient(settings);
        }

        public async Task<bool> IndexCatalogAsync(Catalog catalog)
        {
            var response = await _client.IndexAsync(catalog, idx => idx.Index(_defaultIndex));
            return response.IsSuccess();
        }

        public async Task<System.Collections.Generic.IEnumerable<Catalog>> SearchCatalogAsync(string keyword)
        {
            var response = await _client.SearchAsync<Catalog>(s => s
                .Query(query => query
                    .MultiMatch(m => m
                        .Fields(new[] { "title", "author" })
                        .Query(keyword)
                        .Fuzziness(new Fuzziness("AUTO"))
                    )
                )
            );

            return response.Documents;
        }
    }
}
