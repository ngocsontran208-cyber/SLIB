using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface IReceivingService
    {
        Task<bool> ReceivePieceAsync(int pieceId, string userId);
    }
}
