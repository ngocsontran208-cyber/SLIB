using Elastic.Clients.Elasticsearch;
using LibrarySystem.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace LibrarySystem.Infrastructure.Search
{
    public class DigitalAssetDocument
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FullText { get; set; } = string.Empty;
    }

    public class AssetSearchResult
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string HighlightSnippet { get; set; } = string.Empty;
    }

    public interface IElasticsearchService
    {
        Task<bool> IndexCatalogAsync(Catalog catalog);
        Task<System.Collections.Generic.IEnumerable<Catalog>> SearchCatalogAsync(string keyword);
        Task<bool> IndexDigitalAssetAsync(DigitalAssetDocument asset);
        Task<System.Collections.Generic.IEnumerable<AssetSearchResult>> SearchDigitalAssetAsync(string keyword);
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

        public async Task<bool> IndexDigitalAssetAsync(DigitalAssetDocument asset)
        {
            var response = await _client.IndexAsync(asset, idx => idx.Index("digital-assets"));
            return response.IsSuccess();
        }

        public async Task<System.Collections.Generic.IEnumerable<AssetSearchResult>> SearchDigitalAssetAsync(string keyword)
        {
            var response = await _client.SearchAsync<DigitalAssetDocument>(s => s
                .Index("digital-assets")
                .Query(q => q
                    .Match(m => m
                        .Field(f => f.FullText)
                        .Query(keyword)
                    )
                )
                .Highlight(h => h
                    .PreTags(new[] { "<em class='bg-yellow-200 text-yellow-900 font-bold px-1 rounded'>" })
                    .PostTags(new[] { "</em>" })
                    .Fields(f => f.Add("fullText", new Elastic.Clients.Elasticsearch.Core.Search.HighlightField()))
                )
            );

            var results = new System.Collections.Generic.List<AssetSearchResult>();
            
            if (response.Hits != null)
            {
                foreach (var hit in response.Hits)
                {
                    var snippet = "";
                    if (hit.Highlight != null && hit.Highlight.TryGetValue("fullText", out var highlights))
                    {
                        snippet = string.Join(" ... ", highlights);
                    }
                    
                    if (hit.Source != null)
                    {
                        results.Add(new AssetSearchResult
                        {
                            Id = hit.Source.Id,
                            Title = hit.Source.Title,
                            HighlightSnippet = snippet
                        });
                    }
                }
            }

            return results;
        }
    }
}
