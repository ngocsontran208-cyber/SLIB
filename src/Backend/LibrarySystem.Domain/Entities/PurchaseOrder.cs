using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class PurchaseOrder
    {
        public int Id { get; set; }
        public string PONumber { get; set; } = string.Empty;
        
        public int VendorId { get; set; }
        public Vendor Vendor { get; set; } = null!;
        
        /// <summary>
        /// Loại đơn: One-time (Mua 1 lần), Ongoing (Định kỳ/Tạp chí)
        /// </summary>
        public string OrderType { get; set; } = "One-time";
        
        /// <summary>
        /// Trạng thái: Pending, Open (đã gửi), Closed
        /// </summary>
        public string Status { get; set; } = "Pending";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public ICollection<PurchaseOrderLine> OrderLines { get; set; } = new List<PurchaseOrderLine>();
    }
}
