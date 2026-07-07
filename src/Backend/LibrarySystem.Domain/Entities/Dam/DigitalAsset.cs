using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.Dam
{
    public class DigitalAsset
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;
        public string? Checksum { get; set; }
        
        public int? DrmPolicyId { get; set; }
        public DrmPolicy? DrmPolicy { get; set; }
        
        public ICollection<DigitalAssetValue> MetadataValues { get; set; } = new List<DigitalAssetValue>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
