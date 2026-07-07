using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class MarcTemplate
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Tên mẫu biên mục (VD: "Sách in tiếng Việt")
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Loại tài liệu (VD: Book, Journal, Thesis, Map, Audio...)
        /// </summary>
        public string DocumentType { get; set; } = "Book";
        
        /// <summary>
        /// Mô tả mẫu
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Ngày tạo
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Cấu hình các trường thuộc mẫu này
        /// </summary>
        public ICollection<TemplateFieldConfig> FieldConfigs { get; set; } = new List<TemplateFieldConfig>();
        
        /// <summary>
        /// Danh sách các bản ghi thư mục được tạo từ mẫu này
        /// </summary>
        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<BibliographicRecord> BibliographicRecords { get; set; } = new List<BibliographicRecord>();
    }
}
