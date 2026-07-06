using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class ElectronicResourceLicense
    {
        public int Id { get; set; }
        
        public int VendorId { get; set; }
        public Vendor Vendor { get; set; } = null!;

        public string ResourceName { get; set; } = string.Empty;
        
        // Chi phí mua/đăng ký cho vòng đời này
        public decimal Cost { get; set; }
        
        // Số lượng người truy cập tối đa đồng thời
        public int ConcurrentUsers { get; set; }

        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }

        // Cấu hình kết nối API SUSHI
        public string? SushiApiUrl { get; set; }
        public string? SushiApiKey { get; set; }
        public string? RequestorId { get; set; }

        // Lịch sử thu thập dữ liệu COUNTER
        public ICollection<CounterStatistic> CounterStatistics { get; set; } = new List<CounterStatistic>();
    }
}
