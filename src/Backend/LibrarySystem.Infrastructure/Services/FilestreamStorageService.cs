using LibrarySystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace LibrarySystem.Infrastructure.Services
{
    public class FilestreamStorageService : IStorageService
    {
        private readonly string _connectionString;
        private readonly string _localUploadPath;

        public FilestreamStorageService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
            _localUploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "DigitalAssets");
            
            if (!Directory.Exists(_localUploadPath))
            {
                Directory.CreateDirectory(_localUploadPath);
            }
        }

        public async Task<string> SaveFileAsync(string tempFilePath, string fileName, string contentType)
        {
            // Kiểm tra hệ điều hành. Chỉ Windows mới hỗ trợ SqlFileStream
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // TODO: Triển khai SqlFileStream. Hiện tại trả về thư mục cục bộ (Fallback)
                return await SaveToLocalFileSystemAsync(tempFilePath, fileName);
            }
            else
            {
                // Môi trường Mac/Linux (Docker)
                return await SaveToLocalFileSystemAsync(tempFilePath, fileName);
            }
        }

        private async Task<string> SaveToLocalFileSystemAsync(string tempFilePath, string fileName)
        {
            string uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            string destinationPath = Path.Combine(_localUploadPath, uniqueFileName);

            // Chuyển file từ Temp sang thư mục chính thức (Move để nhanh hơn Copy)
            if (File.Exists(destinationPath))
            {
                File.Delete(destinationPath);
            }
            File.Move(tempFilePath, destinationPath);

            return await Task.FromResult(destinationPath);
        }

        /* 
        // LÝ THUYẾT: Code thực thi SQL FILESTREAM chuẩn cho Windows (Yêu cầu table DigitalAssetFiles có cột FileStreamData)
        // using Microsoft.Data.SqlClient;
        // using System.Data.SqlTypes;
        private async Task<string> SaveToSqlFileStreamAsync(string tempFilePath, string fileName)
        {
            Guid fileId = Guid.NewGuid();
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    // 1. Tạo row rỗng
                    var cmdInsert = new SqlCommand("INSERT INTO DigitalAssetFiles (Id, FileName, FileStreamData) VALUES (@Id, @Name, 0x)", connection, transaction);
                    cmdInsert.Parameters.AddWithValue("@Id", fileId);
                    cmdInsert.Parameters.AddWithValue("@Name", fileName);
                    await cmdInsert.ExecuteNonQueryAsync();

                    // 2. Lấy PathName và Transaction Context
                    var cmdPath = new SqlCommand("SELECT FileStreamData.PathName(), GET_FILESTREAM_TRANSACTION_CONTEXT() FROM DigitalAssetFiles WHERE Id = @Id", connection, transaction);
                    cmdPath.Parameters.AddWithValue("@Id", fileId);
                    
                    string pathName = null;
                    byte[] tranContext = null;

                    using (var reader = await cmdPath.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            pathName = reader.GetString(0);
                            tranContext = (byte[])reader.GetValue(1);
                        }
                    }

                    // 3. Sử dụng SqlFileStream để ghi trực tiếp không chiếm RAM
                    // using (var sqlFileStream = new SqlFileStream(pathName, tranContext, FileAccess.Write))
                    // using (var localFileStream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read))
                    // {
                    //    await localFileStream.CopyToAsync(sqlFileStream);
                    // }

                    transaction.Commit();
                }
            }
            File.Delete(tempFilePath);
            return $"sqlfs://{fileId}";
        }
        */

        public async Task<Stream> GetFileStreamAsync(string filePath)
        {
            if (filePath.StartsWith("sqlfs://"))
            {
                throw new NotImplementedException("Lấy dữ liệu từ SqlFileStream chỉ hỗ trợ trên môi trường Windows.");
            }

            if (File.Exists(filePath))
            {
                return await Task.FromResult(new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read));
            }

            throw new FileNotFoundException("File not found", filePath);
        }

        public Task DeleteFileAsync(string filePath)
        {
            if (!filePath.StartsWith("sqlfs://") && File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            return Task.CompletedTask;
        }
    }
}
