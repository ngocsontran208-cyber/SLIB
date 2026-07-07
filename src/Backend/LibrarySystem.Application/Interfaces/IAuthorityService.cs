using System.Collections.Generic;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface IAuthorityService
    {
        Task<IEnumerable<AuthorityRecord>> SuggestAuthoritiesAsync(string query, string type = "Personal Name");
        Task<AuthorityRecord> CreateAuthorityAsync(AuthorityRecord record);
        Task LinkBibliographicRecordAsync(int bibliographicRecordId, List<MarcField> bibFields);
    }
}
