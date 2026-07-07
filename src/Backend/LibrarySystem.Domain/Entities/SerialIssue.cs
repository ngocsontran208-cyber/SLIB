using System;

namespace LibrarySystem.Domain.Entities
{
    public class SerialIssue
    {
        public int Id { get; set; }
        
        public int SerialSubscriptionId { get; set; }
        public SerialSubscription SerialSubscription { get; set; } = null!;

        public string Enumeration { get; set; } = string.Empty; // v.1 no.1
        public string Chronology { get; set; } = string.Empty;  // 2024-01

        public DateTime ExpectedDate { get; set; }
        public string Status { get; set; } = "Expected"; // Expected, Received, Claimed

        // Sẽ có giá trị khi Status = Received và ấn phẩm được check-in vào kho
        public int? PhysicalItemId { get; set; }
        public PhysicalItem? PhysicalItem { get; set; }
    }
}
