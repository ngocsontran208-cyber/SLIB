using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendInventoryScanResult(object scanResult)
        {
            await Clients.All.SendAsync("ReceiveInventoryScan", scanResult);
        }

        public async Task SendAssetStatus(int assetId, string status, string message)
        {
            await Clients.All.SendAsync("ReceiveAssetStatus", assetId, status, message);
        }
    }
}
