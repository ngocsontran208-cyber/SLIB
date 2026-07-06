using System;

namespace LibrarySystem.Domain.Entities
{
    public class Piece
    {
        public int Id { get; set; }
        
        public int PurchaseOrderLineId { get; set; }
        public PurchaseOrderLine PurchaseOrderLine { get; set; } = null!;

        public string? Barcode { get; set; }
        
        /// <summary>
        /// Trạng thái: Expected (chờ nhận), Received (đã nhận), Unreceivable (hủy/không thể nhận)
        /// </summary>
        public string Status { get; set; } = "Expected";

        public DateTime? ReceivedDate { get; set; }
        public string? ReceivedBy { get; set; }
    }
}
