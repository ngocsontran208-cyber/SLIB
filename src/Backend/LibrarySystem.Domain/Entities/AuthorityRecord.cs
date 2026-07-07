using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class AuthorityRecord
    {
        public int Id { get; set; }
        
        public string AuthorityType { get; set; } = "Personal Name"; // Personal Name, Corporate, Subject

        /// <summary>
        /// Nhan đề / Điểm truy cập chính (Trích xuất từ trường 100, 110, 150)
        /// </summary>
        public string MainEntry { get; set; } = string.Empty;

        /// <summary>
        /// Dữ liệu MARC 21 Authority được ánh xạ thành Native JSON
        /// </summary>
        public List<MarcField> Fields { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public ICollection<BibAuthorityLink> LinkedBibliographics { get; set; } = new List<BibAuthorityLink>();
    }
}
