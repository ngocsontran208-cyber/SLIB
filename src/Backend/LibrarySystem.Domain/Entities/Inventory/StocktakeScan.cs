using System;

namespace LibrarySystem.Domain.Entities.Inventory
{
    public class StocktakeScan
    {
        public int Id { get; set; }
        
        public int SessionId { get; set; }
        public StocktakeSession Session { get; set; } = null!;

        public int PhysicalItemId { get; set; }
        public PhysicalItem PhysicalItem { get; set; } = null!;

        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
        
        public string ExpectedStatus { get; set; } = string.Empty; // Available, Borrowed, Lost...
        public string ResultColor { get; set; } = "Green"; // Green, Red, Yellow
    }
}
