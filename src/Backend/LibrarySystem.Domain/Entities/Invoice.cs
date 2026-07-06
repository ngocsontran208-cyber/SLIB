using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        
        public int VendorId { get; set; }
        public Vendor Vendor { get; set; } = null!;

        public decimal TotalAmount { get; set; }
        
        /// <summary>
        /// Trạng thái: Open, Approved, Paid
        /// </summary>
        public string Status { get; set; } = "Open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaymentDate { get; set; }

        public ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
    }
}
