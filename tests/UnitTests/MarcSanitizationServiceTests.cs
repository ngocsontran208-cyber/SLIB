using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.Services.Marc;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace UnitTests
{
    public class MarcSanitizationServiceTests
    {
        [Fact]
        public async Task SanitizeMarcRecordAsync_ShouldRemoveUnauthorizedTagsAndSubfields()
        {
            // Arrange
            var templates = new List<MarcTemplate>
            {
                new MarcTemplate
                {
                    Id = 1,
                    Name = "Default",
                    IsActive = true,
                    FieldConfigs = new List<TemplateFieldConfig>
                    {
                        new TemplateFieldConfig { Tag = "245", AllowedSubfields = "[\"a\", \"b\"]" },
                        new TemplateFieldConfig { Tag = "100", AllowedSubfields = "[\"a\"]" }
                    }
                }
            };

            var mockDbSet = templates.BuildMockDbSet();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .Options;
            var mockContext = new Mock<ApplicationDbContext>(options);
            mockContext.Setup(c => c.MarcTemplates).Returns(mockDbSet.Object);

            var service = new MarcSanitizationService(mockContext.Object);

            var rawFields = new List<MarcField>
            {
                new MarcField 
                { 
                    Tag = "245", 
                    Subfields = new List<MarcSubfield> 
                    { 
                        new MarcSubfield { Code = "a", Value = "Valid Title" }, 
                        new MarcSubfield { Code = "c", Value = "Unauthorized subfield" } 
                    } 
                },
                new MarcField 
                { 
                    Tag = "500", // Unauthorized Tag
                    Subfields = new List<MarcSubfield> 
                    { 
                        new MarcSubfield { Code = "a", Value = "Note" } 
                    } 
                }
            };

            // Act
            var result = await service.SanitizeMarcRecordAsync(1, rawFields);

            // Assert
            Assert.Single(result); // Only 245 should remain
            var field245 = result.First(f => f.Tag == "245");
            Assert.Single(field245.Subfields); // Only 'a' should remain, 'c' is removed
            Assert.Equal("Valid Title", field245.Subfields.First(s => s.Code == "a").Value);
        }
    }
}
