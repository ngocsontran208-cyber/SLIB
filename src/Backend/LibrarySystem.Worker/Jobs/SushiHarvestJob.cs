using System;
using System.Threading.Tasks;
using LibrarySystem.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Worker.Jobs
{
    public class SushiHarvestJob
    {
        private readonly ISushiHarvestService _sushiHarvestService;
        private readonly ILogger<SushiHarvestJob> _logger;

        public SushiHarvestJob(ISushiHarvestService sushiHarvestService, ILogger<SushiHarvestJob> logger)
        {
            _sushiHarvestService = sushiHarvestService;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation($"[{DateTime.UtcNow}] Bắt đầu tiến trình thu thập dữ liệu SUSHI (COUNTER 5)...");
            
            try
            {
                await _sushiHarvestService.HarvestSushiDataAsync();
                _logger.LogInformation($"[{DateTime.UtcNow}] Hoàn tất tiến trình thu thập dữ liệu SUSHI.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[{DateTime.UtcNow}] Lỗi khi thu thập dữ liệu SUSHI.");
            }
        }
    }
}
