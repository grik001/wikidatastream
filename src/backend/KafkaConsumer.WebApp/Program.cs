using Common.Models.Configurations;
using Common.Models.Data.Mapper;
using Common.Models.Domains;
using Common.Services.Kafka;
using Common.Services.MongoDB;
using Confluent.Kafka;
using KafkaConsumer.WebApp.Configs;
using KafkaConsumer.WebApp.Hubs;
using Microsoft.Extensions.Options;
using MongoDB.Bson.IO;

namespace KafkaConsumer.WebApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var corsOriginsAllowed = builder.Configuration.GetSection("AppSettings:CorsOriginsAllowed").Get<string[]>();

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(
                        corsOriginsAllowed
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            builder.Services.Configure<AppSettingOptions>(builder.Configuration.GetSection("AppSettings"));
            builder.Services.Configure<KafkaOptions>(builder.Configuration.GetSection("Kafka"));
            builder.Services.AddSingleton<IKafkaConsumerService, KafkaConsumerService>();
            builder.Services.AddSingleton<IKafkaProducerService, KafkaProducerService>();

            builder.Services.AddSingleton<IHostedService, KafkaProducerFromStreamService>();
            builder.Services.AddSingleton<IHostedService, KafkaConsumerHostedService>();

            // Register MongoDB service
            builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
            builder.Services.AddSingleton<IMongoDatabaseService, MongoDatabaseService>();

            //SignalR
            builder.Services.AddSignalR();
            builder.Services.AddControllers(); // Enable controllers

            var app = builder.Build();

            // Enable CORS globally
            app.UseCors();

            // Configure the HTTP request pipeline if needed
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapHub<MyHub>("/myhub");
            app.MapGet("/", () => "Hello World!");
            app.MapControllers();
            app.Run();
        }
    }
}
