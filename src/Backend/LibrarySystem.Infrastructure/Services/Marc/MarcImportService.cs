using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;

namespace LibrarySystem.Infrastructure.Services.Marc
{
    public class MarcImportService : IMarcImportService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMarcValidationService _validationService;

        public MarcImportService(ApplicationDbContext context, IMarcValidationService validationService)
        {
            _context = context;
            _validationService = validationService;
        }

        public async Task<(int SuccessCount, int FailureCount)> ProcessMarcBinaryStreamAsync(Stream mrcStream, int templateId, string? userId)
        {
            int successCount = 0;
            int failureCount = 0;

            using var reader = new BinaryReader(mrcStream);
            
            // Xử lý đọc Stream giả lập (ISO-2709 thực tế cần parse Directory và Variable fields phức tạp hơn)
            // Trong bản thiết kế Giai đoạn 2 này, ta dùng vòng lặp đọc độ dài bản ghi (5 bytes đầu)
            while (reader.BaseStream.Position < reader.BaseStream.Length)
            {
                try
                {
                    // Đọc Record Length (5 bytes)
                    byte[] lengthBytes = reader.ReadBytes(5);
                    if (lengthBytes.Length < 5) break;

                    string lengthStr = System.Text.Encoding.ASCII.GetString(lengthBytes);
                    if (!int.TryParse(lengthStr, out int recordLength) || recordLength <= 5)
                    {
                        failureCount++;
                        break; // Định dạng lỗi
                    }

                    // Đọc phần còn lại của bản ghi (recordLength - 5)
                    byte[] recordData = reader.ReadBytes(recordLength - 5);
                    
                    // Giả lập logic Parse ISO-2709 thành Danh sách MarcField
                    // (Thực tế sẽ sử dụng hàm giải mã MARC21 nhị phân)
                    var parsedFields = new System.Collections.Generic.List<MarcField>
                    {
                        new MarcField
                        {
                            Tag = "245",
                            Subfields = new System.Collections.Generic.List<MarcSubfield> { new MarcSubfield { Code = "a", Value = "Imported Book Title" } }
                        }
                    };
                    
                    // Validation thông qua Service (Áp dụng RBAC từ cấu hình Mẫu)
                    var validationResult = await _validationService.ValidateMarcDataAsync(templateId, parsedFields);
                    
                    if (validationResult.IsValid)
                    {
                        var record = new BibliographicRecord
                        {
                            TemplateId = templateId,
                            Title = "Imported Book Title", // Sẽ extract từ JSON 245$a
                            Fields = parsedFields,
                            CreatedBy = userId,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.BibliographicRecords.Add(record);
                        successCount++;
                    }
                    else
                    {
                        // Ghi log thất bại (có thể phát triển tính năng ImportLog ở đây)
                        failureCount++;
                    }
                    
                    // Batch lưu CSDL mỗi 100 bản ghi để tối ưu RAM và tốc độ
                    if (successCount > 0 && successCount % 100 == 0)
                    {
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception)
                {
                    failureCount++;
                }
            }

            // Lưu các bản ghi còn lại
            if (_context.ChangeTracker.HasChanges())
            {
                await _context.SaveChangesAsync();
            }

            return (successCount, failureCount);
        }
    }
}
