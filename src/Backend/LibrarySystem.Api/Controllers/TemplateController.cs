using LibrarySystem.Application.Services;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Librarian")]
    public class TemplateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITemplateParserService _parser;

        public TemplateController(ApplicationDbContext context, ITemplateParserService parser)
        {
            _context = context;
            _parser = parser;
        }

        [HttpGet]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _context.NotificationTemplates.ToListAsync();
            return Ok(templates);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplate(int id)
        {
            var template = await _context.NotificationTemplates.FindAsync(id);
            if (template == null) return NotFound();
            return Ok(template);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] NotificationTemplate template)
        {
            _context.NotificationTemplates.Add(template);
            await _context.SaveChangesAsync();
            return Ok(template);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] NotificationTemplate updated)
        {
            var template = await _context.NotificationTemplates.FindAsync(id);
            if (template == null) return NotFound();

            template.Name = updated.Name;
            template.Type = updated.Type;
            template.Content = updated.Content;
            template.DefaultVariables = updated.DefaultVariables;
            template.Description = updated.Description;
            template.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(template);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var template = await _context.NotificationTemplates.FindAsync(id);
            if (template == null) return NotFound();

            _context.NotificationTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class PreviewRequest
        {
            public string Content { get; set; } = string.Empty;
            public Dictionary<string, string> MockData { get; set; } = new();
        }

        [HttpPost("preview")]
        public IActionResult PreviewTemplate([FromBody] PreviewRequest request)
        {
            string rendered = _parser.ParseTemplate(request.Content, request.MockData);
            return Ok(new { renderedContent = rendered });
        }
    }
}
