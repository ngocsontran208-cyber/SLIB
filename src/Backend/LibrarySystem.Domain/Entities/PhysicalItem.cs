using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class PhysicalItem
    {
        public int Id { get; set; }
        public int BibliographicRecordId { get; set; }
        public string Barcode { get; set; } = string.Empty;
        public string Status { get; set; } = "Available"; // Available, Borrowed, Lost, Damaged
        
        // Dùng cho Optimistic Concurrency
        public byte[] RowVersion { get; set; } = null!;

        public BibliographicRecord BibliographicRecord { get; set; } = null!;
        public ICollection<BookLoan> Loans { get; set; } = new List<BookLoan>();
    }
}
