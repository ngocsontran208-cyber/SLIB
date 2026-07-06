using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface ISearchIndexerJob
    {
        Task SyncToElasticAsync(int catalogId);
    }
}
