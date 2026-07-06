using Microsoft.Extensions.Hosting;
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
        private readonly string _queueName = "document_processing_queue";
        private readonly IHttpClientFactory _httpClientFactory;

        public RabbitMqListenerService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
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
                    int userId = docData.GetProperty("UserId").GetInt32();
                    int catalogId = docData.GetProperty("CatalogId").GetInt32();

                    Console.WriteLine($"[Worker] Xử lý xong Catalog {catalogId}. Đang gọi Internal Webhook...");

                    // Gọi Webhook để kích hoạt SignalR
                    var client = _httpClientFactory.CreateClient();
                    var notifyPayload = new { UserId = userId, Message = $"Tài liệu {catalogId} đã được xử lý xong và sẵn sàng!" };
                    var content = new StringContent(JsonSerializer.Serialize(notifyPayload), Encoding.UTF8, "application/json");

                    var response = await client.PostAsync("https://localhost:7219/api/internal/notify", content);
                    if (response.IsSuccessStatusCode)
                    {
                        Console.WriteLine("[Worker] Đã báo cáo thành công qua SignalR.");
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
