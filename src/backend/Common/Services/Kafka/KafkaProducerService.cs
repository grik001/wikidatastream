using Common.Models.Configurations;
using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services.Kafka
{
    public class KafkaProducerService : IKafkaProducerService
    {
        private readonly IProducer<Null, string> _producer;
        private readonly ILogger<KafkaProducerService> _logger;
        private readonly KafkaOptions _kafkaOptions;

        public KafkaProducerService(IOptions<KafkaOptions> kafkaOptions, ILogger<KafkaProducerService> logger)
        {
            _kafkaOptions = kafkaOptions.Value;
            _logger = logger;

            var producerConfig = new ProducerConfig
            {
                BootstrapServers = _kafkaOptions.BootstrapServers,
                SecurityProtocol = SecurityProtocol.SaslSsl,
                SaslMechanism = SaslMechanism.Plain,
                SaslUsername = "$ConnectionString", 
                SaslPassword = _kafkaOptions.ConnectionString 
            };

            _producer = new ProducerBuilder<Null, string>(producerConfig).Build();
        }

        public async Task ProduceAsync(string topic, string message)
        {
            try
            {
                var deliveryResult = await _producer.ProduceAsync(topic, new Message<Null, string>
                {
                    Value = message
                });

                _logger.LogInformation($"Delivered message to {deliveryResult.TopicPartitionOffset}");
            }
            catch (ProduceException<Null, string> ex)
            {
                _logger.LogError($"Error producing message: {ex.Error.Reason}");
            }
        }

        public void Dispose()
        {
            _producer?.Dispose();
        }
    }

    public interface IKafkaProducerService : IDisposable
    {
        Task ProduceAsync(string topic, string message);
    }
}
