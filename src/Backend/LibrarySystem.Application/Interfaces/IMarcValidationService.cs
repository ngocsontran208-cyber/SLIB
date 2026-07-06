using System.Collections.Generic;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public class MarcValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public interface IMarcValidationService
    {
        /// <summary>
        /// Xác thực dữ liệu MARC so với cấu hình Template.
        /// </summary>
        Task<MarcValidationResult> ValidateMarcDataAsync(int templateId, List<MarcField> marcFields);
    }
}
