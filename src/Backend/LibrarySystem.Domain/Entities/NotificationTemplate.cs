using System;

namespace LibrarySystem.Domain.Entities
{
    public class NotificationTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "Email"; // Email or ZPL
        
        public string Content { get; set; } = string.Empty; // HTML for Email, ZPL string for labels
        
        public string? DefaultVariables { get; set; } // JSON list of variables e.g. ["PatronName", "DueDate"]
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
