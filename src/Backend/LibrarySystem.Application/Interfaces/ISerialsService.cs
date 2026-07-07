using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface ISerialsService
    {
        Task<SerialSubscription> CreateSubscriptionAsync(SerialSubscription subscription);
        Task<IEnumerable<SerialIssue>> PredictIssuesAsync(int subscriptionId);
        Task<IEnumerable<SerialIssue>> GetExpectedIssuesAsync(int? subscriptionId = null);
        Task<PhysicalItem> CheckInIssueAsync(int issueId, string? barcode = null);
    }
}
