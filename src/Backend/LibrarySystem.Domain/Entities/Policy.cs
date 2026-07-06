using System;

namespace LibrarySystem.Domain.Entities
{
    public class Policy
    {
        public int Id { get; set; }
        public string PolicyKey { get; set; } = string.Empty;
        public string PolicyValue { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
