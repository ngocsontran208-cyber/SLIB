using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Marc
{
    public class MarcValidationService : IMarcValidationService
    {
        private readonly ApplicationDbContext _context;

        public MarcValidationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MarcValidationResult> ValidateMarcDataAsync(int templateId, List<MarcField> marcFields)
        {
            var result = new MarcValidationResult { IsValid = true };
            
            // Lấy cấu hình của Template từ DB
            var template = await _context.MarcTemplates
                .Include(t => t.FieldConfigs)
                .FirstOrDefaultAsync(t => t.Id == templateId);

            if (template == null || !template.IsActive)
            {
                result.IsValid = false;
                result.Errors.Add($"Template with ID {templateId} does not exist or is inactive.");
                return result;
            }

            if (marcFields == null || marcFields.Count == 0)
            {
                result.IsValid = false;
                result.Errors.Add("Invalid MARC data. Expected a list of fields.");
                return result;
            }

            var inputTags = marcFields.Select(f => f.Tag).Where(t => !string.IsNullOrEmpty(t)).ToHashSet();

            // 1. Kiểm tra các trường bắt buộc và giá trị trống
            var requiredConfigs = template.FieldConfigs.Where(c => c.IsRequired).ToList();
            foreach (var req in requiredConfigs)
            {
                var inputField = marcFields.FirstOrDefault(f => f.Tag == req.Tag);
                if (inputField == null)
                {
                    result.IsValid = false;
                    
                    // Thông báo lỗi tùy chỉnh theo Loại tài liệu (Cross-validation)
                    if (template.DocumentType == "Thesis" && req.Tag == "502")
                        result.Errors.Add($"Luận văn bắt buộc phải có trường 502 (Ghi chú luận án).");
                    else
                        result.Errors.Add($"Mẫu '{template.Name}' bắt buộc phải có trường {req.Tag}.");
                }
                else
                {
                    // Kiểm tra rỗng (Empty Value Check)
                    bool hasValue = false;
                    if (inputField.Subfields != null && inputField.Subfields.Any(s => !string.IsNullOrWhiteSpace(s.Value)))
                        hasValue = true;

                    if (!hasValue)
                    {
                        result.IsValid = false;
                        result.Errors.Add($"Trường bắt buộc {req.Tag} không được để trống giá trị.");
                    }
                }
            }

            // 2. Kiểm tra tính hợp lệ của các trường và trường con được nhập vào
            foreach (var field in marcFields)
            {
                string? tag = field.Tag;
                if (string.IsNullOrEmpty(tag)) continue;

                var config = template.FieldConfigs.FirstOrDefault(c => c.Tag == tag);
                if (config == null)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Tag {tag} is not allowed in this template.");
                    continue;
                }

                if (field.Subfields != null && field.Subfields.Count > 0)
                {
                    var allowedSubfields = string.IsNullOrEmpty(config.AllowedSubfields) 
                        ? new List<string>() 
                        : JsonSerializer.Deserialize<List<string>>(config.AllowedSubfields) ?? new List<string>();

                    foreach (var subfield in field.Subfields)
                    {
                        if (!allowedSubfields.Contains(subfield.Code))
                        {
                            result.IsValid = false;
                            result.Errors.Add($"Subfield '{subfield.Code}' is not allowed for tag {tag} in this template.");
                        }
                    }
                }
            }

            return result;
        }
    }
}
