using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class SerialSubscription
    {
        public int Id { get; set; }
        
        public int BibliographicRecordId { get; set; }
        public BibliographicRecord BibliographicRecord { get; set; } = null!;

        public int? PurchaseOrderLineId { get; set; }
        public PurchaseOrderLine? PurchaseOrderLine { get; set; }

        public string Source { get; set; } = "Purchase"; // Purchase, Gift, Exchange
        public string Title { get; set; } = string.Empty;
        public string ISSN { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active"; // Active, Cancelled, Completed

        public ICollection<PredictionPattern> PredictionPatterns { get; set; } = new List<PredictionPattern>();
        public ICollection<SerialIssue> Issues { get; set; } = new List<SerialIssue>();
    }
}
