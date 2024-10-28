using Microsoft.AspNetCore.SignalR;

namespace KafkaConsumer.WebApp.Hubs
{
    public class MyHub : Hub
    {
        private readonly ILogger<MyHub> _logger;

        public MyHub(ILogger<MyHub> logger)
        {
            _logger = logger;
        }

        // Called when a client sends a message
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        // Log when a client connects
        public override async Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;

            // Log the connection event
            _logger.LogInformation($"Client connected: {connectionId}");

            await base.OnConnectedAsync();
        }
    }
}
