using System.IO;
using System.Threading.Tasks;

namespace LibrarySystem.Application.Interfaces
{
    public interface IStorageService
    {
        /// <summary>
        /// Lưu file từ thư mục tạm vào Storage chính thức (Local File System hoặc SQL FILESTREAM)
        /// </summary>
        /// <param name="tempFilePath">Đường dẫn file tạm đã nối xong (merged)</param>
        /// <param name="fileName">Tên file ban đầu</param>
        /// <param name="contentType">Loại định dạng file</param>
        /// <returns>Đường dẫn hoặc ID lưu trữ</returns>
        Task<string> SaveFileAsync(string tempFilePath, string fileName, string contentType);

        /// <summary>
        /// Lấy stream của file dựa vào filePath hoặc ID
        /// </summary>
        Task<Stream> GetFileStreamAsync(string filePath);

        /// <summary>
        /// Xóa file khỏi hệ thống
        /// </summary>
        Task DeleteFileAsync(string filePath);
    }
}
