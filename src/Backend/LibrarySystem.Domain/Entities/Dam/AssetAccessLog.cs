using System;

namespace LibrarySystem.Domain.Entities.Dam
{
    public class AssetAccessLog
    {
        public int Id { get; set; }
        
        public int DigitalAssetId { get; set; }
        public DigitalAsset Asset { get; set; } = null!;
        
        public string UserEmail { get; set; } = string.Empty;
        
        public string IpAddress { get; set; } = string.Empty;
        
        public string Device { get; set; } = string.Empty;
        
        public DateTime AccessedAt { get; set; } = DateTime.UtcNow;
        
        // "Stream", "Render", "Download"
        public string AccessType { get; set; } = string.Empty;
    }
}
