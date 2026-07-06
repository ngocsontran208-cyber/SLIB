using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface IAcquisitionService
    {
        Task<PurchaseOrderLine> CreatePurchaseOrderLineAsync(PurchaseOrderLine pol, string userId);
    }
}
