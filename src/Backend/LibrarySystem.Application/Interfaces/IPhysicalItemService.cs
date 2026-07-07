using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface IPhysicalItemService
    {
        Task<bool> ReportLostDamagedAsync(int physicalItemId, string status, string userId);
        Task<bool> WeedItemAsync(int physicalItemId, string userId);
        Task<BookLoan?> CheckOutAsync(int physicalItemId, int userId);
    }
}
