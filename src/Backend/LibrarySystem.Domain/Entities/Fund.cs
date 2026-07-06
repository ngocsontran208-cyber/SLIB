using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class Fund
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public decimal TotalBudget { get; set; }
        
        /// <summary>
        /// Tiền đang tạm giữ (khi tạo PO/POL)
        /// </summary>
        public decimal CommittedAmount { get; set; }
        
        /// <summary>
        /// Tiền đã thực sự chi trả (khi thanh toán Invoice)
        /// </summary>
        public decimal SpentAmount { get; set; }
        
        /// <summary>
        /// Số dư khả dụng = TotalBudget - CommittedAmount - SpentAmount
        /// </summary>
        public decimal AvailableBalance => TotalBudget - CommittedAmount - SpentAmount;

        public ICollection<PurchaseOrderLine> PurchaseOrderLines { get; set; } = new List<PurchaseOrderLine>();
    }
}
