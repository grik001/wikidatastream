using Common.Models.Data;
using Common.Models.Domains;
using Common.Services.MongoDB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KafkaConsumer.WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HubStatusController : ControllerBase
    {

        public HubStatusController()
        {
        }

        [HttpGet]
        public ActionResult<bool> Get()
        {
            return Ok(true);
        }
    }
}
