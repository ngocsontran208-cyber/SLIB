using System.Text.Json;
using System.Text;
using RabbitMQ.Client;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Services
{
    public class RabbitMqProducer
    {
        private readonly string _hostname = "localhost";
        private readonly string _queueName = "document_processing_queue";
        private readonly string _assetQueueName = "digital-asset-processing";

        public async Task SendFileUploadedEventAsync(int catalogId, string filePath, int userId)
        {
            var factory = new ConnectionFactory { HostName = _hostname };
            using var connection = await factory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(queue: _queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var message = new { CatalogId = catalogId, FilePath = filePath, UserId = userId };
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            await channel.BasicPublishAsync(exchange: "", routingKey: _queueName, mandatory: false, body: body);
        }

        public async Task SendAssetProcessingEventAsync(int assetId)
        {
            var factory = new ConnectionFactory { HostName = _hostname };
            using var connection = await factory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(queue: _assetQueueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

            var message = new { AssetId = assetId };
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            await channel.BasicPublishAsync(exchange: "", routingKey: _assetQueueName, mandatory: false, body: body);
        }
    }
}
