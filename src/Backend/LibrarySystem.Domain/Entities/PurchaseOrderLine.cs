using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class PurchaseOrderLine
    {
        public int Id { get; set; }
        
        public int PurchaseOrderId { get; set; }
        public PurchaseOrder PurchaseOrder { get; set; } = null!;
        
        public int FundId { get; set; }
        public Fund Fund { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Link đến BibliographicRecord (Brief Record được sinh tự động)
        /// </summary>
        public int? BibliographicRecordId { get; set; }
        public BibliographicRecord? BibliographicRecord { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Quantity * UnitPrice;

        public DateTime? ExpectedReceiptDate { get; set; }

        public ICollection<Piece> Pieces { get; set; } = new List<Piece>();
        public ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
    }
}
