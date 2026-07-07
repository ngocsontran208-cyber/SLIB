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
        
        // Link to MARC 21 Bibliographic Record
        public int? BibliographicRecordId { get; set; }
        public BibliographicRecord? BibliographicRecord { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
