using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class Catalog
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? ISBN { get; set; }
        public int? PublishYear { get; set; }
        public string? Category { get; set; }
        public string Type { get; set; } = "Physical"; // Physical, Digital
        
        public ICollection<PhysicalItem> PhysicalItems { get; set; } = new List<PhysicalItem>();
    }
}
