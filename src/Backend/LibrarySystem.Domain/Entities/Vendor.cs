using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class Vendor
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? ContactPerson { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
