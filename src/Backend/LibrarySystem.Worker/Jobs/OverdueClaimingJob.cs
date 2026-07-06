using System;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Worker.Jobs
{
    public class OverdueClaimingJob
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OverdueClaimingJob> _logger;

        public OverdueClaimingJob(ApplicationDbContext context, ILogger<OverdueClaimingJob> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("Starting Overdue Claiming Job...");

            var today = DateTime.UtcNow.Date;

            // Quét các Pieces đang Expected và đã quá hạn
            var overduePieces = await _context.Pieces
                .Include(p => p.PurchaseOrderLine)
                    .ThenInclude(pol => pol.PurchaseOrder)
                        .ThenInclude(po => po.Vendor)
                .Where(p => p.Status == "Expected" 
                            && p.PurchaseOrderLine.ExpectedReceiptDate.HasValue 
                            && p.PurchaseOrderLine.ExpectedReceiptDate.Value.Date < today)
                .ToListAsync();

            if (!overduePieces.Any())
            {
                _logger.LogInformation("No overdue pieces found.");
                return;
            }

            foreach (var piece in overduePieces)
            {
                var vendor = piece.PurchaseOrderLine.PurchaseOrder.Vendor;
                var email = vendor.Email ?? "No Email";
                
                // Thực tế sẽ tích hợp EmailService để gửi mail (VD: SMTP/SendGrid)
                _logger.LogWarning($"[CLAIM] Sending claim to Vendor '{vendor.Name}' ({email}) for POL Title '{piece.PurchaseOrderLine.Title}'. Expected Date was: {piece.PurchaseOrderLine.ExpectedReceiptDate:yyyy-MM-dd}.");
            }

            _logger.LogInformation($"Completed Claiming for {overduePieces.Count} pieces.");
        }
    }
}
