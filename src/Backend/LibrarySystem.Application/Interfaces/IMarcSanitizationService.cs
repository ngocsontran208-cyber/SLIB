using System.Collections.Generic;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface IMarcSanitizationService
    {
        /// <summary>
        /// Làm sạch (Sanitize) cấu trúc MARC thô theo cấu hình của Template.
        /// Các trường/trường con không được cấu hình sẽ bị loại bỏ.
        /// </summary>
        Task<List<MarcField>> SanitizeMarcRecordAsync(int templateId, List<MarcField> rawMarcFields);
    }
}
