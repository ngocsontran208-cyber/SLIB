using System;

namespace LibrarySystem.Domain.Entities
{
    public class TemplateFieldConfig
    {
        public int Id { get; set; }
        
        public int TemplateId { get; set; }
        public MarcTemplate Template { get; set; } = null!;
        
        /// <summary>
        /// Mã trường (Tag) lấy từ MarcDictionary
        /// </summary>
        public string Tag { get; set; } = string.Empty;
        
        /// <summary>
        /// Chuỗi JSON chứa mảng các mã subfield được phép sử dụng trong mẫu này
        /// VD: ["a", "b", "c"]
        /// </summary>
        public string? AllowedSubfields { get; set; }
        
        /// <summary>
        /// Đánh dấu trường này là bắt buộc nhập
        /// </summary>
        public bool IsRequired { get; set; }
        
        /// <summary>
        /// Giá trị mặc định (nếu có)
        /// </summary>
        public string? DefaultValue { get; set; }
    }
}
