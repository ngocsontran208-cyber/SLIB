using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface IPhysicalItemService
    {
        Task<bool> ReportLostDamagedAsync(int physicalItemId, string status, string userId);
        Task<bool> WeedItemAsync(int physicalItemId, string userId);
    }
}
