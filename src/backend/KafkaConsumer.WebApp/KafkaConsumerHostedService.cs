using Common.Models.Configurations;
using Common.Models.Data.Mapper;
using Common.Models.Domains;
using Common.Models.Domains.Mapper;
using Common.Services.Kafka;
using Common.Services.MongoDB;
using Confluent.Kafka;
using KafkaConsumer.WebApp.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace KafkaConsumer.WebApp
{
    public class KafkaConsumerHostedService : IHostedService
    {
        private readonly IKafkaConsumerService _kafkaConsumerService;
        private readonly IMongoDatabaseService _mongoDatabaseService; // Inject the MongoDB service
        private readonly IHubContext<MyHub> _hubContext;
        private readonly CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();
        private readonly string _topic;

        public KafkaConsumerHostedService(
             IKafkaConsumerService kafkaConsumerService,
             IMongoDatabaseService mongoDatabaseService,
             IHubContext<MyHub> hubContext,  // Add the HubContext for MyHub
                IOptions<KafkaOptions> kafkaOptions)
        {
            _kafkaConsumerService = kafkaConsumerService;
            _mongoDatabaseService = mongoDatabaseService;
            _hubContext = hubContext;  // Initialize the HubContext
            _topic = kafkaOptions.Value.Topic;  // Get the topic from configuration

        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            // Start Kafka consumer and pass the topic and process action to the consumer service
            _ = Task.Run(() => _kafkaConsumerService.Consume(_topic, _cancellationTokenSource.Token, PushToMongoAndHub), cancellationToken);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _cancellationTokenSource.Cancel();
            return Task.CompletedTask;
        }

        private async Task PushToMongoAndHub(string message)
        {
            if (!string.IsNullOrEmpty(message))
            {
                // Parse the JSON to a JObject for easy access to nested properties
                JObject jsonObject = JObject.Parse(message);
                WikiData wikiData = jsonObject.ToObject<WikiData>();
                wikiData.Domain = jsonObject["meta"]?["domain"]?.ToString();

                if (wikiData != null)
                {
                    var mongoData = StreamToMongoMapper.MapToMongo(wikiData);
                    await _mongoDatabaseService.InsertDocumentAsync("recentchanges", mongoData);
                    var hubData = HubWikiStatDataMapper.MapToHub(wikiData);
                    await _hubContext.Clients.All.SendAsync("statsMessage", "KafkaConsumer", hubData);
                    await _hubContext.Clients.All.SendAsync("commentsMessage", "KafkaConsumer", mongoData);
                }
            }
        }
    }
}
