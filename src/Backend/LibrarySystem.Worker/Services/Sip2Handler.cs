using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Worker.Services
{
    public class Sip2Handler
    {
        private readonly ApplicationDbContext _context;
        private readonly RfidHardwareController _rfidHardwareController;
        private readonly ILogger<Sip2Handler> _logger;

        public Sip2Handler(ApplicationDbContext context, RfidHardwareController rfidHardwareController, ILogger<Sip2Handler> logger)
        {
            _context = context;
            _rfidHardwareController = rfidHardwareController;
            _logger = logger;
        }

        public async Task<string> ProcessMessageAsync(string message)
        {
            if (string.IsNullOrWhiteSpace(message) || message.Length < 2)
            {
                return "96|"; // Unknown
            }

            var messageType = message.Substring(0, 2);
            switch (messageType)
            {
                case "23": // Patron Status Request
                    return await HandlePatronStatusRequestAsync(message);
                case "11": // Checkout Request
                    return await HandleCheckoutRequestAsync(message);
                default:
                    _logger.LogWarning($"Unknown SIP2 Message Type: {messageType}");
                    return "96|";
            }
        }

        private async Task<string> HandlePatronStatusRequestAsync(string message)
        {
            // Parse patron ID from string. Pattern: AO{patronId}|
            var patronId = ExtractField(message, "AO");
            if (string.IsNullOrEmpty(patronId))
            {
                return "24 N           0000000000000|"; // Invalid
            }

            var user = await _context.Users
                .Include(u => u.Loans)
                .FirstOrDefaultAsync(u => u.Username == patronId || u.Id.ToString() == patronId);

            if (user == null || !user.IsActive)
            {
                // Y/N indicates if patron is valid
                return $"24 N           {DateTime.UtcNow:yyyyMMdd    HHmmss}|AO{patronId}|";
            }

            // Check if patron has debts or overdue items
            bool hasDebts = user.Loans.Any(l => l.FineAmount > 0 || (l.DueDate < DateTime.UtcNow && l.Status == "Borrowed"));
            
            // Build Message 24 (Patron Status Response)
            // Format: 24<status><date>|AO<patronId>|CQ<ValidY/N>|
            var validFlag = hasDebts ? "N" : "Y";
            
            return $"24 Y           {DateTime.UtcNow:yyyyMMdd    HHmmss}|AO{patronId}|CQ{validFlag}|";
        }

        private async Task<string> HandleCheckoutRequestAsync(string message)
        {
            // Parse patron ID and item barcode
            var patronId = ExtractField(message, "AO");
            var barcode = ExtractField(message, "AB");

            if (string.IsNullOrEmpty(patronId) || string.IsNullOrEmpty(barcode))
            {
                return "120N|"; // Failed
            }

            var user = await _context.Users
                .Include(u => u.Loans)
                .FirstOrDefaultAsync(u => u.Username == patronId || u.Id.ToString() == patronId);

            var item = await _context.PhysicalItems.FirstOrDefaultAsync(p => p.Barcode == barcode);

            if (user == null || item == null || item.Status != "Available")
            {
                return $"120N{DateTime.UtcNow:yyyyMMdd    HHmmss}|AO{patronId}|AB{barcode}|";
            }

            // Execute Checkout
            var loan = new BookLoan
            {
                UserId = user.Id,
                PhysicalItemId = item.Id,
                BorrowDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14), // Mặc định 14 ngày
                Status = "Borrowed"
            };

            item.Status = "Borrowed";
            _context.BookLoans.Add(loan);
            _context.PhysicalItems.Update(item);
            await _context.SaveChangesAsync();

            // Interact with RFID Hardware to disable EAS bit
            _rfidHardwareController.ToggleEasBit(barcode, enableSecurity: false);

            // Message 12 (Checkout Response) -> 1 (Success) 
            return $"121N{DateTime.UtcNow:yyyyMMdd    HHmmss}|AO{patronId}|AB{barcode}|AH{loan.DueDate:yyyyMMdd}|";
        }

        private string? ExtractField(string message, string fieldCode)
        {
            var match = Regex.Match(message, $@"{fieldCode}([^\|]+)\|");
            if (match.Success)
            {
                return match.Groups[1].Value;
            }
            return null;
        }
    }
}
