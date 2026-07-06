using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Infrastructure.Data;

using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Infrastructure.Services.Marc
{
    public class SruClientService : ISruClientService
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;

        public SruClientService(HttpClient httpClient, ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _context = context;
        }

        public async Task<List<MarcField>?> SearchByIsbnAsync(int targetId, string isbn)
        {
            var target = await _context.SruTargets.FindAsync(targetId);
            if (target == null || !target.IsActive) return null;

            // Xây dựng URL truy vấn SRU (chuẩn LOC: ?operation=searchRetrieve&version=1.1&query=bath.isbn=...)
            var url = $"{target.BaseUrl}?operation=searchRetrieve&version=1.1&query=bath.isbn={isbn}&recordSchema=marcxml";
            
            try
            {
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var xmlContent = await response.Content.ReadAsStringAsync();
                var xdoc = XDocument.Parse(xmlContent);

                // SRU trả về namespace, ta bỏ qua namespace để parse dễ hơn
                var records = xdoc.Descendants().Where(x => x.Name.LocalName == "record");
                var firstRecord = records.FirstOrDefault();

                if (firstRecord == null) return null;

                var marcFields = new List<MarcField>();

                // Xử lý các datafield
                var dataFields = firstRecord.Descendants().Where(e => e.Name.LocalName == "datafield");
                foreach (var field in dataFields)
                {
                    var tag = field.Attribute("tag")?.Value;
                    if (string.IsNullOrEmpty(tag)) continue;

                    var subfields = new System.Collections.Generic.List<MarcSubfield>();
                    foreach (var subfield in field.Descendants().Where(e => e.Name.LocalName == "subfield"))
                    {
                        var code = subfield.Attribute("code")?.Value;
                        var value = subfield.Value;
                        if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(value))
                        {
                            subfields.Add(new MarcSubfield { Code = code, Value = value });
                        }
                    }

                    if (subfields.Count > 0)
                    {
                        marcFields.Add(new MarcField { Tag = tag, Subfields = subfields });
                    }
                }

                return marcFields;
            }
            catch (Exception)
            {
                // Thực tế nên ghi log lỗi
                return null;
            }
        }
    }
}
