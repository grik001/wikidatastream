using Common.Models.Configurations;
using Common.Models.Data.Mapper;
using Common.Models.Domains;
using Common.Services.Kafka;
using Common.Services.MongoDB;
using Confluent.Kafka;
using KafkaConsumer.WebApp.Configs;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Threading;

namespace KafkaConsumer.WebApp
{
    public class KafkaProducerFromStreamService : IHostedService
    {
        private static readonly HttpClient httpClient = new HttpClient();
        private readonly IKafkaProducerService _kafkaProducerService;
        private CancellationTokenSource _cancellationTokenSource;
        private readonly string _topic;  // Declare the Kafka topic field
        private readonly string _wikiStreamUrl;
        private readonly int _streamReadThrottleInMS;

        // Initialize the topic in the constructor
        public KafkaProducerFromStreamService(IKafkaProducerService kafkaProducerService, IOptions<KafkaOptions> kafkaOptions, IOptions<AppSettingOptions> appSettingOptions)
        {
            _kafkaProducerService = kafkaProducerService;
            _topic = kafkaOptions.Value.Topic;  // Get the topic from configuration
            _wikiStreamUrl = appSettingOptions.Value.WikiStreamUrl;
            _streamReadThrottleInMS = appSettingOptions.Value.StreamReadThrottleInMS;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _cancellationTokenSource = new CancellationTokenSource();

            // Start ingesting in the background
            _ = Task.Run(() => StartIngestingAsync(ProcessRecentChangeAsync), cancellationToken);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public async Task StartIngestingAsync(Func<string, Task> processAction)
        {
            var streamUrl = _wikiStreamUrl;
            var cancellationTokenSource = new CancellationTokenSource();
            var cancellationToken = cancellationTokenSource.Token;

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    // Open the stream
                    var response = await httpClient.GetAsync(streamUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
                    response.EnsureSuccessStatusCode();

                    // Read the stream
                    using (var stream = await response.Content.ReadAsStreamAsync())
                    using (var reader = new StreamReader(stream))
                    {
                        var lastReadTime = DateTime.UtcNow;

                        while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
                        {
                            await Task.Delay(_streamReadThrottleInMS);
                            if (DateTime.UtcNow - lastReadTime > TimeSpan.FromMinutes(1))
                            {
                                // Reconnect if no data is received within 1 minute
                                Console.WriteLine("No data received. Reconnecting...");
                                break;
                            }

                            var line = await reader.ReadLineAsync();

                            if (!string.IsNullOrWhiteSpace(line) && line.StartsWith("data:"))
                            {
                                lastReadTime = DateTime.UtcNow; // Reset the timer on data receipt
                                string json = line.Substring(5).Trim();

                                try
                                {
                                    if (!string.IsNullOrWhiteSpace(json))
                                    {
                                        await processAction(json);
                                    }
                                }
                                catch (JsonException ex)
                                {
                                    Console.WriteLine("Failed to deserialize JSON: " + ex.Message);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Stream connection error: " + ex.Message);
                }

                // Delay before retrying to avoid quick reconnect loops
                await Task.Delay(TimeSpan.FromSeconds(15), cancellationToken);
            }
        }

        public async Task ProcessRecentChangeAsync(string json)
        {
            await _kafkaProducerService.ProduceAsync(_topic, json);
        }

       
    }
}
