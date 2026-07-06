using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface IErmService
    {
        Task<decimal> CalculateCostPerUseAsync(int licenseId, int year);
    }
}
