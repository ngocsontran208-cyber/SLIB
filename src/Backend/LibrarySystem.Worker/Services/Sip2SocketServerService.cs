using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Worker.Services
{
    public class Sip2SocketServerService : BackgroundService
    {
        private readonly ILogger<Sip2SocketServerService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private const int Port = 6009;

        public Sip2SocketServerService(ILogger<Sip2SocketServerService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            TcpListener listener = new TcpListener(IPAddress.Any, Port);
            try
            {
                listener.Start();
                _logger.LogInformation($"[SIP2] Socket Server is listening on port {Port}...");

                while (!stoppingToken.IsCancellationRequested)
                {
                    // Chấp nhận kết nối bất đồng bộ
                    var tcpClient = await listener.AcceptTcpClientAsync(stoppingToken);
                    _logger.LogInformation($"[SIP2] Accepted connection from {tcpClient.Client.RemoteEndPoint}");

                    // Xử lý Client trong một luồng riêng biệt để không chặn máy chủ
                    _ = Task.Run(() => HandleClientAsync(tcpClient, stoppingToken), stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("[SIP2] Socket Server is shutting down.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SIP2] Socket Server encountered an error.");
            }
            finally
            {
                listener.Stop();
            }
        }

        private async Task HandleClientAsync(TcpClient client, CancellationToken stoppingToken)
        {
            using (client)
            using (var stream = client.GetStream())
            using (var reader = new StreamReader(stream, Encoding.ASCII))
            using (var writer = new StreamWriter(stream, Encoding.ASCII) { AutoFlush = true })
            {
                try
                {
                    while (!stoppingToken.IsCancellationRequested)
                    {
                        var message = await reader.ReadLineAsync();
                        if (message == null)
                        {
                            break; // Client ngắt kết nối
                        }

                        _logger.LogInformation($"[SIP2 IN]: {message}");

                        // Khởi tạo Scope để lấy DbContext (vì BackgroundService là Singleton)
                        using (var scope = _scopeFactory.CreateScope())
                        {
                            var sip2Handler = scope.ServiceProvider.GetRequiredService<Sip2Handler>();
                            var response = await sip2Handler.ProcessMessageAsync(message);

                            _logger.LogInformation($"[SIP2 OUT]: {response}");
                            await writer.WriteLineAsync(response);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SIP2] Error handling client connection.");
                }
            }
            
            _logger.LogInformation("[SIP2] Client disconnected.");
        }
    }
}
