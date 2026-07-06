using System;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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
    }
}
