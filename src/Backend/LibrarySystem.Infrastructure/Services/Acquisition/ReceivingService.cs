using System;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Acquisition
{
    public class ReceivingService : IReceivingService
    {
        private readonly ApplicationDbContext _context;

        public ReceivingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ReceivePieceAsync(int pieceId, string userId)
        {
            // Bắt đầu Transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var piece = await _context.Pieces
                    .Include(p => p.PurchaseOrderLine)
                    .FirstOrDefaultAsync(p => p.Id == pieceId);

                if (piece == null || piece.Status == "Received")
                    return false;

                // 1.5 Sinh mã Barcode từ Sequence và Policy
                string barcodePrefix = "";
                var policy = await _context.LibraryPolicies.FirstOrDefaultAsync(p => p.PolicyKey == "BarcodePrefix");
                if (policy != null && !string.IsNullOrEmpty(policy.PolicyValue))
                {
                    barcodePrefix = policy.PolicyValue;
                }

                int seqValue = 0;
                if (_context.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
                {
                    // Lấy số từ Sequence (Atomic)
                    seqValue = await _context.Database.SqlQueryRaw<int>("SELECT NEXT VALUE FOR BarcodeSequence").SingleAsync();
                }
                else
                {
                    // Cho InMemory fallback
                    seqValue = new Random().Next(100000, 999999);
                }
                
                string generatedBarcode = $"{barcodePrefix}{seqValue}";

                // 1. Cập nhật Piece thành Received
                piece.Status = "Received";
                piece.Barcode = generatedBarcode;
                piece.ReceivedBy = userId;
                piece.ReceivedDate = DateTime.UtcNow;

                _context.Pieces.Update(piece);

                // 2. Tạo bản ghi PhysicalItem chuyển sang phân hệ Lưu thông (Circulation)
                if (piece.PurchaseOrderLine.BibliographicRecordId.HasValue)
                {
                    int bibId = piece.PurchaseOrderLine.BibliographicRecordId.Value;
                    
                    var physicalItem = new PhysicalItem
                    {
                        Barcode = generatedBarcode,
                        Status = "Available",
                        RowVersion = Array.Empty<byte>(),
                        BibliographicRecordId = bibId
                    };
                    
                    _context.PhysicalItems.Add(physicalItem);

                    // 2.5 Đồng bộ động vào cấu trúc MARC 21 (Trường 852$p)
                    var bibRecord = await _context.BibliographicRecords.FindAsync(bibId);
                    if (bibRecord != null)
                    {
                        bibRecord.Fields.Add(new MarcField
                        {
                            Tag = "852",
                            Subfields = new System.Collections.Generic.List<MarcSubfield>
                            {
                                new MarcSubfield { Code = "p", Value = generatedBarcode }
                            }
                        });
                        _context.BibliographicRecords.Update(bibRecord);
                    }
                }

                // 3. (Tuỳ chọn) Kiểm tra xem POL đã hoàn thành 100% chưa
                // Ở đây ta cứ lưu lại
                await _context.SaveChangesAsync();
                
                // Commit Giao dịch
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
