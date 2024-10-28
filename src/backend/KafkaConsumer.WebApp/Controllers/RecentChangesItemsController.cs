using Common.Models.Data;
using Common.Models.Domains;
using Common.Services.MongoDB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KafkaConsumer.WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecentChangesItemsController : ControllerBase
    {
        private readonly IMongoDatabaseService _mongoDatabaseService;

        public RecentChangesItemsController(IMongoDatabaseService mongoDatabaseService)
        {
            _mongoDatabaseService = mongoDatabaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WikiDataDto>>> GetItems()
        {
            var collectionName = "recentchanges"; // The name of your MongoDB collection
            var items = await _mongoDatabaseService.RetrieveDocumentsAsync<MongoWikiDataModel>(collectionName, 100);

            if (items == null || items.Count == 0)
            {
                return NotFound("No items found.");
            }

            return Ok(items);
        }
    }
}
