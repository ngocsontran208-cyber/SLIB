using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Infrastructure.Services.Erm
{
    public class SushiHarvestService : ISushiHarvestService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly ILogger<SushiHarvestService> _logger;

        public SushiHarvestService(ApplicationDbContext context, HttpClient httpClient, ILogger<SushiHarvestService> logger)
        {
            _context = context;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task HarvestSushiDataAsync()
        {
            var licenses = await _context.ElectronicResourceLicenses
                .Where(l => !string.IsNullOrEmpty(l.SushiApiUrl) && !string.IsNullOrEmpty(l.SushiApiKey))
                .ToListAsync();

            var currentMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-1); 
            // Thường harvest dữ liệu của tháng trước
            var beginDate = currentMonth.ToString("yyyy-MM-dd");
            var endDate = currentMonth.AddMonths(1).AddDays(-1).ToString("yyyy-MM-dd");

            foreach (var license in licenses)
            {
                try
                {
                    // URL chuẩn SUSHI / COUNTER 5 cho báo cáo Title Master Report (TR_J1)
                    var requestUrl = $"{license.SushiApiUrl}/reports/tr?customer_id={license.RequestorId}&requestor_id={license.RequestorId}&begin_date={beginDate}&end_date={endDate}";
                    
                    _httpClient.DefaultRequestHeaders.Clear();
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {license.SushiApiKey}");
                    
                    _logger.LogInformation($"Harvesting SUSHI data from {requestUrl}");

                    var response = await _httpClient.GetAsync(requestUrl);
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Failed to harvest SUSHI data for License {license.Id}. Status: {response.StatusCode}");
                        continue;
                    }

                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(jsonString);

                    // Phân giải cấu trúc COUNTER 5 JSON
                    int totalRequests = 0;
                    int successfulArticleRequests = 0;

                    if (jsonDoc.RootElement.TryGetProperty("Report_Items", out var reportItems))
                    {
                        foreach (var item in reportItems.EnumerateArray())
                        {
                            if (item.TryGetProperty("Performance", out var performances))
                            {
                                foreach (var perf in performances.EnumerateArray())
                                {
                                    if (perf.TryGetProperty("Instance", out var instances))
                                    {
                                        foreach (var instance in instances.EnumerateArray())
                                        {
                                            var metricType = instance.GetProperty("Metric_Type").GetString();
                                            var count = instance.GetProperty("Count").GetInt32();

                                            if (metricType == "Total_Item_Requests")
                                            {
                                                totalRequests += count;
                                            }
                                            else if (metricType == "Unique_Item_Requests") // Hoặc một biến thể của Successful Article Requests
                                            {
                                                successfulArticleRequests += count;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Lưu thống kê vào CSDL
                    var stat = new CounterStatistic
                    {
                        LicenseId = license.Id,
                        ReportingMonth = currentMonth,
                        MetricType = "TR_J1",
                        TotalRequests = totalRequests,
                        SuccessfulArticleRequests = successfulArticleRequests > 0 ? successfulArticleRequests : totalRequests
                    };

                    _context.CounterStatistics.Add(stat);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error harvesting SUSHI for License {license.Id}");
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
