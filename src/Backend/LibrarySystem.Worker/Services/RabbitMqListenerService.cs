using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace LibrarySystem.Worker.Services
{
    public class RabbitMqListenerService : BackgroundService
    {
        private readonly string _hostname = "localhost";
        private readonly string _queueName = "digital-asset-processing";
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceProvider _serviceProvider;

        public RabbitMqListenerService(IHttpClientFactory httpClientFactory, IServiceProvider serviceProvider)
        {
            _httpClientFactory = httpClientFactory;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory { HostName = _hostname };
            using var connection = await factory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(queue: _queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                Console.WriteLine($"[RabbitMQ] Received: {message}");

                try
                {
                    // Mô phỏng tác vụ nặng (Bóc tách PDF, Áp dụng DRM...)
                    await Task.Delay(5000, stoppingToken);

                    // Phân tích message
                    var docData = JsonSerializer.Deserialize<JsonElement>(message);
                    
                    if (docData.TryGetProperty("AssetId", out var assetIdProp))
                    {
                        int assetId = assetIdProp.GetInt32();
                        Console.WriteLine($"[RabbitMQ] Nhận yêu cầu bóc tách AssetId: {assetId}");
                        
                        using var scope = _serviceProvider.CreateScope();
                        var job = scope.ServiceProvider.GetRequiredService<LibrarySystem.Worker.Jobs.AssetProcessingJob>();
                        await job.ProcessAssetAsync(assetId);
                        
                        // Thông báo về SignalR (Tuỳ chọn)
                        var client = _httpClientFactory.CreateClient();
                        var notifyPayload = new { UserId = 1, Message = $"Tài liệu AssetId {assetId} đã được xử lý xong và index lên Elastic!" };
                        var content = new StringContent(JsonSerializer.Serialize(notifyPayload), Encoding.UTF8, "application/json");
                        await client.PostAsync("https://localhost:7219/api/internal/notify", content);
                    }
                    else if (docData.TryGetProperty("CatalogId", out var catalogIdProp))
                    {
                        int catalogId = catalogIdProp.GetInt32();
                        Console.WriteLine($"[Worker] Đã nhận CatalogId {catalogId}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Worker Error]: {ex.Message}");
                }
            };

            await channel.BasicConsumeAsync(queue: _queueName, autoAck: true, consumer: consumer);

            // Chờ cho đến khi BackgroundService bị tắt
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
