using System;

namespace LibrarySystem.Domain.Entities
{
    public class CounterStatistic
    {
        public int Id { get; set; }

        public int LicenseId { get; set; }
        public ElectronicResourceLicense License { get; set; } = null!;

        // Tháng báo cáo (Thường chỉ lấy Year/Month)
        public DateTime ReportingMonth { get; set; }

        // Loại metric (VD: TR_J1, JR1, v.v.)
        public string MetricType { get; set; } = string.Empty;

        // Tổng số lượt Request
        public int TotalRequests { get; set; }

        // Số lượt tải bài báo thành công
        public int SuccessfulArticleRequests { get; set; }
    }
}
