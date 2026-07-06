using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.Services.Marc;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using Moq.Protected;
using Xunit;

namespace UnitTests
{
    public class SruClientServiceTests
    {
        [Fact]
        public async Task SearchByIsbnAsync_ShouldParseMarcXmlToMarcFields()
        {
            // Arrange
            var sruTargets = new List<SruTarget>
            {
                new SruTarget
                {
                    Id = 1,
                    Name = "Library of Congress",
                    BaseUrl = "https://lx2.loc.gov:210/LCDB",
                    IsActive = true
                }
            };

            var mockDbSet = sruTargets.BuildMockDbSet();
            mockDbSet.Setup(x => x.FindAsync(It.IsAny<object[]>())).ReturnsAsync((object[] ids) => sruTargets.FirstOrDefault(t => t.Id == (int)ids[0]));

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .Options;
            var mockContext = new Mock<ApplicationDbContext>(options);
            mockContext.Setup(c => c.SruTargets).Returns(mockDbSet.Object);
            
            // Mock HTTP Client to return dummy MARCXML
            var dummyXml = @"<?xml version=""1.0""?>
            <searchRetrieveResponse xmlns=""http://www.loc.gov/zing/srw/"">
                <records>
                    <record>
                        <recordData>
                            <record xmlns=""http://www.loc.gov/MARC21/slim"">
                                <datafield tag=""245"" ind1=""1"" ind2=""0"">
                                    <subfield code=""a"">Test Book Title</subfield>
                                </datafield>
                            </record>
                        </recordData>
                    </record>
                </records>
            </searchRetrieveResponse>";

            var handlerMock = new Mock<HttpMessageHandler>();
            handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(dummyXml)
                });

            var httpClient = new HttpClient(handlerMock.Object);
            var service = new SruClientService(httpClient, mockContext.Object);

            // Act
            var result = await service.SearchByIsbnAsync(1, "1234567890");

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("245", result[0].Tag);
            var subfieldA = result[0].Subfields.FirstOrDefault(s => s.Code == "a");
            Assert.NotNull(subfieldA);
            Assert.Equal("Test Book Title", subfieldA.Value);
        }
    }
}
