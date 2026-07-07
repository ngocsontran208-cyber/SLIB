using System;

namespace LibrarySystem.Domain.Entities.Ill
{
    public class IllRequest
    {
        public int Id { get; set; }
        public int PatronId { get; set; } // Liên kết tới User/Patron
        public User Patron { get; set; } = null!;
        
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        
        public int PartnerId { get; set; }
        public IllPartner Partner { get; set; } = null!;
        
        // Status: Pending, InTransit, Received, Returned
        public string Status { get; set; } = "Pending";
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpectedDate { get; set; }
    }
}
