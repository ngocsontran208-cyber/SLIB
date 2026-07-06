using System.IO;
using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface IMarcImportService
    {
        /// <summary>
        /// Nhập hàng loạt bản ghi từ luồng định dạng nhị phân ISO-2709 (.mrc)
        /// Trả về số lượng bản ghi import thành công và thất bại.
        /// </summary>
        Task<(int SuccessCount, int FailureCount)> ProcessMarcBinaryStreamAsync(Stream mrcStream, int templateId, string? userId);
    }
}
