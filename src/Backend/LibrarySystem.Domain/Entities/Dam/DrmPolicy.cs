using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.Dam
{
    public class DrmPolicy
    {
        public int Id { get; set; }
        public string PolicyName { get; set; } = string.Empty;
        public bool AllowDownload { get; set; } = false;
        public string? WatermarkText { get; set; }
        public int MaxPreviewPages { get; set; } = 0;
        public int ExpirationDays { get; set; } = 0;
        
        public ICollection<DigitalAsset> Assets { get; set; } = new List<DigitalAsset>();
    }
}
