using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Acquisition
{
    public class SerialsService : ISerialsService
    {
        private readonly ApplicationDbContext _context;

        public SerialsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SerialSubscription> CreateSubscriptionAsync(SerialSubscription subscription)
        {
            _context.SerialSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<IEnumerable<SerialIssue>> PredictIssuesAsync(int subscriptionId)
        {
            var subscription = await _context.SerialSubscriptions
                .Include(s => s.PredictionPatterns)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);

            if (subscription == null) throw new Exception("Subscription not found.");

            var pattern = subscription.PredictionPatterns.FirstOrDefault();
            if (pattern == null) throw new Exception("No prediction pattern found for this subscription.");

            var issues = new List<SerialIssue>();
            
            // Simple Prediction Engine based on Frequency
            DateTime currentDate = subscription.StartDate;
            int issueNumber = 1;
            
            while (currentDate <= subscription.EndDate)
            {
                var issue = new SerialIssue
                {
                    SerialSubscriptionId = subscription.Id,
                    Enumeration = $"{pattern.VolumeCaption}1 {pattern.IssueCaption}{issueNumber}", // Giả lập Volume 1
                    Chronology = currentDate.ToString("yyyy-MM"),
                    ExpectedDate = currentDate,
                    Status = "Expected"
                };
                
                issues.Add(issue);
                
                // Increment based on Frequency (m = monthly, w = weekly, q = quarterly)
                if (pattern.Frequency == "m")
                {
                    currentDate = currentDate.AddMonths(1);
                }
                else if (pattern.Frequency == "q")
                {
                    currentDate = currentDate.AddMonths(3);
                }
                else if (pattern.Frequency == "w")
                {
                    currentDate = currentDate.AddDays(7);
                }
                else
                {
                    // Mặc định hàng tháng nếu không nhận diện được
                    currentDate = currentDate.AddMonths(1);
                }
                
                issueNumber++;
            }

            _context.SerialIssues.AddRange(issues);
            await _context.SaveChangesAsync();

            return issues;
        }

        public async Task<IEnumerable<SerialIssue>> GetExpectedIssuesAsync(int? subscriptionId = null)
        {
            var query = _context.SerialIssues
                .Include(i => i.SerialSubscription)
                .ThenInclude(s => s.BibliographicRecord)
                .AsQueryable();

            if (subscriptionId.HasValue)
            {
                query = query.Where(i => i.SerialSubscriptionId == subscriptionId.Value);
            }

            return await query.OrderBy(i => i.ExpectedDate).ToListAsync();
        }

        public async Task<PhysicalItem> CheckInIssueAsync(int issueId, string? barcode = null)
        {
            var issue = await _context.SerialIssues
                .Include(i => i.SerialSubscription)
                .FirstOrDefaultAsync(i => i.Id == issueId);

            if (issue == null) throw new Exception("Issue not found");
            if (issue.Status == "Received") throw new Exception("Issue already received");

            // Tạo mã vạch: Nếu người dùng không nhập, dùng sequence (Giả lập bằng timestamp/random cho nhanh)
            string actualBarcode = string.IsNullOrEmpty(barcode) 
                ? $"SR-{DateTime.Now.Ticks.ToString().Substring(8)}" 
                : barcode;

            var physicalItem = new PhysicalItem
            {
                BibliographicRecordId = issue.SerialSubscription.BibliographicRecordId,
                Barcode = actualBarcode,
                Status = "Available"
            };

            _context.PhysicalItems.Add(physicalItem);
            
            // Cập nhật trạng thái Issue
            issue.Status = "Received";
            issue.PhysicalItem = physicalItem;

            await _context.SaveChangesAsync();

            return physicalItem;
        }
    }
}
