using System;

namespace LibrarySystem.Domain.Entities
{
    public class MarcDictionary
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Mã trường (Tag), ví dụ: "245", "100"
        /// </summary>
        public string Tag { get; set; } = string.Empty;
        
        /// <summary>
        /// Tên trường, ví dụ: "Title Statement"
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Mô tả ý nghĩa trường
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Trường có được phép lặp lại hay không
        /// </summary>
        public bool IsRepeatable { get; set; }
        
        /// <summary>
        /// Loại trường: "Control" (00X) hoặc "Data" (01X-99X)
        /// </summary>
        public string FieldType { get; set; } = "Data";
        
        /// <summary>
        /// Chuỗi JSON chứa định nghĩa các Subfields hợp lệ.
        /// Ví dụ: [{"code": "a", "name": "Title", "repeatable": false}, {"code": "b", "name": "Remainder of title", "repeatable": false}]
        /// </summary>
        public string? SubfieldsDefinition { get; set; }
    }
}
