using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models.Configurations;
using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Common.Services.Kafka
{
    public class KafkaConsumerService : IKafkaConsumerService
    {
        private readonly IConsumer<Ignore, string> _consumer;
        private readonly ILogger<KafkaConsumerService> _logger;
        private readonly KafkaOptions _kafkaOptions;

        public KafkaConsumerService(IOptions<KafkaOptions> kafkaOptions, ILogger<KafkaConsumerService> logger)
        {
            _kafkaOptions = kafkaOptions.Value;
            _logger = logger;

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = _kafkaOptions.BootstrapServers,
                GroupId = _kafkaOptions.GroupId,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                SecurityProtocol = SecurityProtocol.SaslSsl,
                SaslMechanism = SaslMechanism.Plain,
                SaslUsername = "$ConnectionString", 
                SaslPassword = _kafkaOptions.ConnectionString 
            };

            _consumer = new ConsumerBuilder<Ignore, string>(consumerConfig).Build();
        }

        public async Task Consume(string topic, CancellationToken cancellationToken, Func<string, Task> processAction)
        {
            _consumer.Subscribe(topic);

            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = _consumer.Consume(cancellationToken);

                        _logger.LogInformation($"Consumed message '{consumeResult.Message.Value}' at: '{consumeResult.TopicPartitionOffset}'.");

                        await processAction(consumeResult.Message.Value);
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogError($"Error consuming message: {ex.Error.Reason}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error consuming message: {ex.Message}");
                    }
                }
            }
            finally
            {
                _consumer.Close();
            }
        }

        public void Dispose()
        {
            _consumer?.Dispose();
        }
    }

    public interface IKafkaConsumerService : IDisposable
    {
        Task Consume(string topic, CancellationToken cancellationToken, Func<string, Task> processAction);
    }
}
