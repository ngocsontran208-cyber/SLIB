namespace LibrarySystem.Domain.Entities
{
    public class BibAuthorityLink
    {
        public int Id { get; set; }
        
        public int BibliographicRecordId { get; set; }
        public BibliographicRecord BibliographicRecord { get; set; } = null!;

        public int AuthorityRecordId { get; set; }
        public AuthorityRecord AuthorityRecord { get; set; } = null!;

        /// <summary>
        /// Lưu trữ thông tin Tag nào đã liên kết tới Authority này (Ví dụ: "100", "700", "650")
        /// </summary>
        public string LinkedTag { get; set; } = string.Empty;
    }
}
