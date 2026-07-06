using System;
using System.Text.Json;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;

namespace LibrarySystem.Infrastructure.Services.Acquisition
{
    public class AcquisitionService : IAcquisitionService
    {
        private readonly ApplicationDbContext _context;

        public AcquisitionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PurchaseOrderLine> CreatePurchaseOrderLineAsync(PurchaseOrderLine pol, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tự động sinh Brief Record (MARC)
                var briefRecord = new BibliographicRecord
                {
                    Title = pol.Title,
                    Fields = new System.Collections.Generic.List<MarcField>
                    {
                        new MarcField
                        {
                            Tag = "245",
                            Subfields = new System.Collections.Generic.List<MarcSubfield> { new MarcSubfield { Code = "a", Value = pol.Title } }
                        }
                    },
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId,
                    TemplateId = 1 // Giả sử TemplateId 1 là Default
                };
                
                _context.BibliographicRecords.Add(briefRecord);
                await _context.SaveChangesAsync();

                // 2. Gắn Brief Record ID vào POL
                pol.BibliographicRecordId = briefRecord.Id;

                // 3. Trừ Fund (Commit)
                var fund = await _context.Funds.FindAsync(pol.FundId);
                if (fund == null || fund.AvailableBalance < pol.TotalPrice)
                    throw new Exception("Insufficient fund balance.");

                fund.CommittedAmount += pol.TotalPrice;
                _context.Funds.Update(fund);

                // 4. Sinh ra các Piece tương ứng với Quantity (chờ nhận)
                for (int i = 0; i < pol.Quantity; i++)
                {
                    pol.Pieces.Add(new Piece
                    {
                        Status = "Expected"
                    });
                }

                _context.PurchaseOrderLines.Add(pol);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return pol;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
