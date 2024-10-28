using MongoDB.Driver;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Common.Models.Configurations;

namespace Common.Services.MongoDB
{
    public class MongoDatabaseService : IMongoDatabaseService
    {
        private readonly IMongoDatabase _database;
        private readonly ILogger<MongoDatabaseService> _logger;

        public MongoDatabaseService(IOptions<MongoDbSettings> mongoDbSettings, ILogger<MongoDatabaseService> logger)
        {
            var client = new MongoClient(mongoDbSettings.Value.ConnectionString);
            _database = client.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _logger = logger;
        }

        public async Task InsertDocumentAsync<T>(string collectionName, T data)
        {
            try
            {
                var collection = _database.GetCollection<T>(collectionName);
                _logger.LogInformation($"Attempting to insert document into collection: {collectionName}");
                await collection.InsertOneAsync(data);
                _logger.LogInformation($"Document successfully inserted into collection: {collectionName}");
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                _logger.LogWarning("Duplicate key exception caught. Document already exists in collection {CollectionName}.", collectionName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while inserting document into collection: {CollectionName}", collectionName);
                throw;
            }
        }

        public async Task<List<T>> RetrieveDocumentsAsync<T>(string collectionName, int maxCount = 1000)
        {
            try
            {
                var collection = _database.GetCollection<T>(collectionName);
                _logger.LogInformation($"Retrieving up to {maxCount} documents from collection: {collectionName}");

                var documents = await collection.Find(_ => true)
                                                .Limit(maxCount) // Limit the number of documents
                                                .ToListAsync();

                _logger.LogInformation($"Successfully retrieved {documents.Count} documents from collection: {collectionName}");

                return documents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving documents from collection: {CollectionName}", collectionName);
                throw;
            }
        }
    }

        public interface IMongoDatabaseService
    {
        Task InsertDocumentAsync<T>(string collectionName, T data);
        Task<List<T>> RetrieveDocumentsAsync<T>(string collectionName, int maxCount = 1000);
    }
}
