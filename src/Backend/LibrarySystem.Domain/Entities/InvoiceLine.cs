namespace LibrarySystem.Domain.Entities
{
    public class InvoiceLine
    {
        public int Id { get; set; }
        
        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public int? PurchaseOrderLineId { get; set; }
        public PurchaseOrderLine? PurchaseOrderLine { get; set; }

        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
