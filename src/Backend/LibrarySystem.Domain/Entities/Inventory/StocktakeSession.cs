using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.Inventory
{
    public class StocktakeSession
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Ví dụ: "Kiểm kê Kho Mở Tầng 2 2026"
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "InProgress"; // InProgress, Completed
        public string CreatedBy { get; set; } = string.Empty;

        public ICollection<StocktakeScan> Scans { get; set; } = new List<StocktakeScan>();
    }
}
