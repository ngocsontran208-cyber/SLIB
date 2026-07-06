using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Marc
{
    public class MarcSanitizationService : IMarcSanitizationService
    {
        private readonly ApplicationDbContext _context;

        public MarcSanitizationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MarcField>> SanitizeMarcRecordAsync(int templateId, List<MarcField> rawMarcFields)
        {
            var template = await _context.MarcTemplates
                .Include(t => t.FieldConfigs)
                .FirstOrDefaultAsync(t => t.Id == templateId);

            var sanitizedFields = new List<MarcField>();

            if (template == null || !template.IsActive || rawMarcFields == null)
                return sanitizedFields; // Trả về rỗng nếu không có template hợp lệ

            foreach (var field in rawMarcFields)
            {
                var tag = field.Tag;
                if (string.IsNullOrEmpty(tag)) continue;

                var config = template.FieldConfigs.FirstOrDefault(c => c.Tag == tag);
                if (config == null) continue; // Bỏ qua field không được phép

                if (field.Subfields != null && field.Subfields.Count > 0)
                {
                    var allowedSubfields = string.IsNullOrEmpty(config.AllowedSubfields) 
                        ? new List<string>() 
                        : JsonSerializer.Deserialize<List<string>>(config.AllowedSubfields) ?? new List<string>();

                    var sanitizedSubfields = field.Subfields
                        .Where(s => allowedSubfields.Contains(s.Code))
                        .ToList();

                    if (sanitizedSubfields.Count > 0)
                    {
                        sanitizedFields.Add(new MarcField { Tag = tag, Subfields = sanitizedSubfields });
                    }
                }
            }

            return sanitizedFields;
        }
    }
}
