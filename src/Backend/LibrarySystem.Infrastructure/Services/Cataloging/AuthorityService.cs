using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Services.Cataloging
{
    public class AuthorityService : IAuthorityService
    {
        private readonly ApplicationDbContext _context;

        public AuthorityService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuthorityRecord>> SuggestAuthoritiesAsync(string query, string type = "Personal Name")
        {
            if (string.IsNullOrWhiteSpace(query)) return new List<AuthorityRecord>();

            return await _context.AuthorityRecords
                .Where(a => a.AuthorityType == type && a.MainEntry.ToLower().Contains(query.ToLower()))
                .Take(10)
                .ToListAsync();
        }

        public async Task<AuthorityRecord> CreateAuthorityAsync(AuthorityRecord record)
        {
            record.CreatedAt = DateTime.UtcNow;
            _context.AuthorityRecords.Add(record);
            await _context.SaveChangesAsync();
            return record;
        }

        public async Task LinkBibliographicRecordAsync(int bibliographicRecordId, List<MarcField> bibFields)
        {
            // Xóa các link cũ
            var existingLinks = await _context.BibAuthorityLinks
                .Where(l => l.BibliographicRecordId == bibliographicRecordId)
                .ToListAsync();
            
            _context.BibAuthorityLinks.RemoveRange(existingLinks);

            // Tìm các trường có khả năng link (100, 700, 650)
            var targetTags = new[] { "100", "700", "650" };
            var fieldsToLink = bibFields.Where(f => targetTags.Contains(f.Tag)).ToList();

            foreach (var field in fieldsToLink)
            {
                var mainEntryValue = field.Subfields.FirstOrDefault(s => s.Code == "a")?.Value;
                if (string.IsNullOrWhiteSpace(mainEntryValue)) continue;

                var authorityType = field.Tag == "650" ? "Subject" : "Personal Name";

                // Tìm trong CSDL Authority có khớp không
                var authority = await _context.AuthorityRecords
                    .FirstOrDefaultAsync(a => a.AuthorityType == authorityType && a.MainEntry.ToLower() == mainEntryValue.ToLower());

                if (authority == null)
                {
                    // Tự động sinh bản ghi nháp nếu chưa có
                    authority = new AuthorityRecord
                    {
                        AuthorityType = authorityType,
                        MainEntry = mainEntryValue,
                        Fields = new List<MarcField>
                        {
                            new MarcField
                            {
                                Tag = field.Tag, // Hoặc ánh xạ 100 -> 100 trong Authority
                                Subfields = new List<MarcSubfield> { new MarcSubfield { Code = "a", Value = mainEntryValue } }
                            }
                        }
                    };
                    _context.AuthorityRecords.Add(authority);
                    await _context.SaveChangesAsync(); // Lưu để lấy ID
                }

                // Tạo Link
                _context.BibAuthorityLinks.Add(new BibAuthorityLink
                {
                    BibliographicRecordId = bibliographicRecordId,
                    AuthorityRecordId = authority.Id,
                    LinkedTag = field.Tag
                });
            }

            await _context.SaveChangesAsync();
        }
    }
}
