using System;

namespace LibrarySystem.Domain.Entities
{
    public class BibliographicRecord
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Tham chiếu đến Mẫu biên mục được sử dụng
        /// </summary>
        public int TemplateId { get; set; }
        public MarcTemplate Template { get; set; } = null!;
        
        /// <summary>
        /// Nhan đề (Trích xuất từ trường 245$a để tìm kiếm và hiển thị nhanh)
        /// </summary>
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Tác giả (Trích xuất từ trường 100$a)
        /// </summary>
        public string? Author { get; set; }
        
        /// <summary>
        /// Dữ liệu MARC 21 được ánh xạ thành Native JSON bởi EF Core 9 (.ToJson())
        /// </summary>
        public List<MarcField> Fields { get; set; } = new();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class MarcField
    {
        public string Tag { get; set; } = string.Empty;
        public List<MarcSubfield> Subfields { get; set; } = new();
    }

    public class MarcSubfield
    {
        public string Code { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
