using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/cataloging/records")]
    [Authorize(Roles = "Librarian")]
    public class CatalogingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMarcValidationService _validationService;
        private readonly IMarcImportService _importService;
        private readonly ISruClientService _sruClientService;
        private readonly IMarcSanitizationService _sanitizationService;
        private readonly IAuthorityService _authorityService;

        public CatalogingController(
            ApplicationDbContext context, 
            IMarcValidationService validationService,
            IMarcImportService importService,
            ISruClientService sruClientService,
            IMarcSanitizationService sanitizationService,
            IAuthorityService authorityService)
        {
            _context = context;
            _validationService = validationService;
            _importService = importService;
            _sruClientService = sruClientService;
            _sanitizationService = sanitizationService;
            _authorityService = authorityService;
        }

        public class CreateRecordRequest
        {
            public int TemplateId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string? Author { get; set; }
            public System.Collections.Generic.List<MarcField> Fields { get; set; } = new();
        }

        [HttpGet]
        public async Task<IActionResult> GetRecords()
        {
            var records = await _context.BibliographicRecords
                .Select(r => new {
                    r.Id,
                    r.Title,
                    r.Author,
                    r.TemplateId,
                    r.CreatedAt,
                    r.CreatedBy
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
                
            return Ok(records);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRecord(int id)
        {
            var record = await _context.BibliographicRecords
                .Include(r => r.Template)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (record == null)
                return NotFound();

            return Ok(record);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecord([FromBody] CreateRecordRequest request)
        {
            // Xác thực động dữ liệu MARC 21 so với cấu hình của Admin
            var validationResult = await _validationService.ValidateMarcDataAsync(request.TemplateId, request.Fields);
            
            if (!validationResult.IsValid)
            {
                return BadRequest(new { 
                    Message = "MARC Validation Failed", 
                    Errors = validationResult.Errors 
                });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var record = new BibliographicRecord
            {
                TemplateId = request.TemplateId,
                Title = request.Title,
                Author = request.Author,
                Fields = request.Fields,
                CreatedBy = userId
            };

            _context.BibliographicRecords.Add(record);
            await _context.SaveChangesAsync();

            // Kích hoạt luồng Authority Control: Tự động liên kết Tác giả / Đề mục
            await _authorityService.LinkBibliographicRecordAsync(record.Id, record.Fields);

            return Ok(record);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportBinaryStream(IFormFile file, [FromQuery] int templateId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            using var stream = file.OpenReadStream();
            var result = await _importService.ProcessMarcBinaryStreamAsync(stream, templateId, userId);

            return Ok(new
            {
                Message = "Import completed",
                SuccessCount = result.SuccessCount,
                FailureCount = result.FailureCount
            });
        }

        [HttpGet("search-online")]
        public async Task<IActionResult> SearchOnline([FromQuery] int targetId, [FromQuery] int templateId, [FromQuery] string isbn)
        {
            if (string.IsNullOrEmpty(isbn))
                return BadRequest("ISBN is required.");

            // Kéo dữ liệu gốc từ Thư viện đối tác
            var rawMarcFields = await _sruClientService.SearchByIsbnAsync(targetId, isbn);
            if (rawMarcFields == null || rawMarcFields.Count == 0)
                return NotFound("Book not found in external library or connection failed.");

            // Lọc dữ liệu qua kính lọc phân quyền của Admin (Sanitization Core)
            var sanitizedMarcFields = await _sanitizationService.SanitizeMarcRecordAsync(templateId, rawMarcFields);

            // Trả về dữ liệu sạch để Frontend hiển thị form preview (chưa lưu)
            return Ok(new
            {
                TargetId = targetId,
                TemplateId = templateId,
                Isbn = isbn,
                MarcData = sanitizedMarcFields
            });
        }
    }
}
