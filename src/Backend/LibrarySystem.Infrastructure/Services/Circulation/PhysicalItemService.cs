using System;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Infrastructure.Services.Circulation
{
    public class PhysicalItemService : IPhysicalItemService
    {
        private readonly ApplicationDbContext _context;

        public PhysicalItemService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ReportLostDamagedAsync(int physicalItemId, string status, string userId)
        {
            if (status != "Lost" && status != "Damaged")
            {
                throw new ArgumentException("Status must be Lost or Damaged");
            }

            var item = await _context.PhysicalItems.FindAsync(physicalItemId);
            if (item == null) return false;

            item.Status = status;
            _context.PhysicalItems.Update(item);
            await _context.SaveChangesAsync();
            
            // TODO: Ghi log vào sổ đăng ký cá biệt điện tử
            
            return true;
        }

        public async Task<bool> WeedItemAsync(int physicalItemId, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var item = await _context.PhysicalItems.FindAsync(physicalItemId);
                if (item == null) return false;

                string barcodeToRemove = item.Barcode;
                int bibId = item.BibliographicRecordId;

                // 1. Xóa PhysicalItem khỏi DB
                _context.PhysicalItems.Remove(item);

                // 2. Cập nhật BibliographicRecord (Xóa subfield 852$p)
                var bibRecord = await _context.BibliographicRecords.FindAsync(bibId);
                if (bibRecord != null)
                {
                    bool fieldModified = false;
                    foreach (var field in bibRecord.Fields.Where(f => f.Tag == "852").ToList())
                    {
                        var pSubfield = field.Subfields.FirstOrDefault(s => s.Code == "p" && s.Value == barcodeToRemove);
                        if (pSubfield != null)
                        {
                            field.Subfields.Remove(pSubfield);
                            fieldModified = true;
                            
                            // Nếu trường 852 không còn subfield nào, ta có thể xóa luôn field đó
                            if (!field.Subfields.Any())
                            {
                                bibRecord.Fields.Remove(field);
                            }
                        }
                    }

                    if (fieldModified)
                    {
                        _context.BibliographicRecords.Update(bibRecord);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BookLoan?> CheckOutAsync(int physicalItemId, int userId)
        {
            var physicalItem = await _context.PhysicalItems.FindAsync(physicalItemId);
            if (physicalItem == null || physicalItem.Status != "Available") 
                throw new Exception("Physical item is not available.");

            // Kiểm tra xem User có đang vi phạm không (quá hạn, mượn tối đa)
            var currentLoans = await _context.BookLoans.CountAsync(l => l.UserId == userId && l.Status == "Borrowed");
            var maxBorrowPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "MaxBorrowItems");
            int maxItems = maxBorrowPolicy != null ? int.Parse(maxBorrowPolicy.PolicyValue) : 5;

            if (currentLoans >= maxItems)
                throw new Exception("User has reached the maximum number of borrowed items.");

            // Kiểm tra quy định Tài liệu dự khóa (Course Reserves)
            var reserveItem = await _context.CourseReserveItems
                .Include(i => i.CourseReserveList)
                .Where(i => i.PhysicalItemId == physicalItemId && 
                            i.CourseReserveList.Status == "Active" &&
                            i.CourseReserveList.ActiveFrom <= DateTime.UtcNow &&
                            i.CourseReserveList.ActiveTo >= DateTime.UtcNow)
                .FirstOrDefaultAsync();

            DateTime dueDate;
            
            if (reserveItem != null)
            {
                // Áp dụng ReservePolicy
                // Ví dụ: ReservePolicy = "2 Hours" hoặc "24 Hours"
                if (reserveItem.ReservePolicy.Contains("Hours", StringComparison.OrdinalIgnoreCase))
                {
                    int hours = int.Parse(reserveItem.ReservePolicy.Split(' ')[0]);
                    dueDate = DateTime.UtcNow.AddHours(hours);
                }
                else
                {
                    // Fallback an toàn nếu Policy cấu hình sai
                    dueDate = DateTime.UtcNow.AddDays(1);
                }
            }
            else
            {
                // Áp dụng Policy mặc định
                var maxDaysPolicy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "MaxBorrowDays");
                int maxDays = maxDaysPolicy != null ? int.Parse(maxDaysPolicy.PolicyValue) : 14;
                dueDate = DateTime.UtcNow.AddDays(maxDays);
            }

            var bookLoan = new BookLoan
            {
                PhysicalItemId = physicalItem.Id,
                UserId = userId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dueDate,
                Status = "Borrowed"
            };

            physicalItem.Status = "Borrowed";
            _context.BookLoans.Add(bookLoan);
            _context.PhysicalItems.Update(physicalItem);
            
            await _context.SaveChangesAsync();
            return bookLoan;
        }
    }
}
