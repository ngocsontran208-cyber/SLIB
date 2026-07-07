using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/admin/marc")]
    public class AdminMarcController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminMarcController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CreateMarcTemplateRequest
        {
            public string Name { get; set; } = string.Empty;
            public string DocumentType { get; set; } = "Book";
            public string? Description { get; set; }
            public bool IsActive { get; set; } = true;
            public ICollection<CreateTemplateFieldConfigRequest> FieldConfigs { get; set; } = new List<CreateTemplateFieldConfigRequest>();
        }

        public class CreateTemplateFieldConfigRequest
        {
            public int Id { get; set; }
            public string Tag { get; set; } = string.Empty;
            public string? AllowedSubfields { get; set; }
            public bool IsRequired { get; set; }
            public string? DefaultValue { get; set; }
        }

        [HttpPost("templates")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateMarcTemplateRequest requestDto)
        {
            if (string.IsNullOrEmpty(requestDto.Name))
                return BadRequest("Template Name is required.");

            var request = new MarcTemplate
            {
                Name = requestDto.Name,
                DocumentType = requestDto.DocumentType,
                Description = requestDto.Description,
                IsActive = requestDto.IsActive,
                FieldConfigs = requestDto.FieldConfigs.Select(f => new TemplateFieldConfig
                {
                    Id = f.Id,
                    Tag = f.Tag,
                    AllowedSubfields = f.AllowedSubfields,
                    IsRequired = f.IsRequired,
                    DefaultValue = f.DefaultValue
                }).ToList()
            };

            _context.MarcTemplates.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPost("templates/{id}/fields")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddTemplateFieldConfig(int id, [FromBody] TemplateFieldConfig request)
        {
            var template = await _context.MarcTemplates.FindAsync(id);
            if (template == null)
                return NotFound("Template not found.");

            request.TemplateId = id;
            _context.TemplateFieldConfigs.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }
        [HttpGet("templates")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _context.MarcTemplates
                .Include(t => t.FieldConfigs)
                .Select(t => new {
                    t.Id,
                    t.Name,
                    t.DocumentType,
                    t.Description,
                    t.IsActive,
                    t.CreatedAt,
                    Fields = t.FieldConfigs.Select(f => new {
                        f.Id,
                        f.Tag,
                        f.AllowedSubfields,
                        f.IsRequired,
                        f.DefaultValue
                    })
                })
                .ToListAsync();
            return Ok(templates);
        }

        [HttpPut("templates/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] MarcTemplate request)
        {
            var template = await _context.MarcTemplates
                .Include(t => t.FieldConfigs)
                .FirstOrDefaultAsync(t => t.Id == id);
                
            if (template == null) return NotFound("Template not found.");

            template.Name = request.Name;
            template.DocumentType = request.DocumentType;
            template.Description = request.Description;
            template.IsActive = request.IsActive;

            _context.TemplateFieldConfigs.RemoveRange(template.FieldConfigs);
            template.FieldConfigs.Clear();

            if (request.FieldConfigs != null)
            {
                foreach (var field in request.FieldConfigs)
                {
                    field.Id = 0;
                    field.TemplateId = id;
                    template.FieldConfigs.Add(field);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(template);
        }

        [HttpDelete("templates/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var template = await _context.MarcTemplates
                .Include(t => t.FieldConfigs)
                .FirstOrDefaultAsync(t => t.Id == id);
                
            if (template == null) return NotFound("Template not found.");

            _context.TemplateFieldConfigs.RemoveRange(template.FieldConfigs);
            _context.MarcTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("templates/fields/{fieldId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTemplateField(int fieldId)
        {
            var field = await _context.TemplateFieldConfigs.FindAsync(fieldId);
            if (field == null) return NotFound("Field not found.");

            _context.TemplateFieldConfigs.Remove(field);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("sru-targets")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSruTarget([FromBody] SruTarget request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.BaseUrl))
                return BadRequest("Name and BaseUrl are required.");

            _context.SruTargets.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpGet("sru-targets")]
        [Authorize(Roles = "Admin,Librarian")]
        public IActionResult GetSruTargets()
        {
            return Ok(_context.SruTargets);
        }

        [HttpPut("sru-targets/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSruTarget(int id, [FromBody] SruTarget request)
        {
            var target = await _context.SruTargets.FindAsync(id);
            if (target == null)
                return NotFound("SRU Target not found.");

            target.Name = request.Name;
            target.BaseUrl = request.BaseUrl;
            target.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(target);
        }

        [HttpDelete("sru-targets/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSruTarget(int id)
        {
            var target = await _context.SruTargets.FindAsync(id);
            if (target == null)
                return NotFound("SRU Target not found.");

            _context.SruTargets.Remove(target);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
