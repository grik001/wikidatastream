using Common.Models.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Domains.Mapper
{
    public static class HubWikiStatDataMapper
    {
        public static HubWikiStatData MapToHub(WikiData streamData)
        {
            return new HubWikiStatData
            {
                Id = streamData.Id,
                Type = streamData.Type,
                Namespace = streamData.Namespace,
                Domain = streamData.Domain,
                Timestamp = streamData.Timestamp
            };
        }
    }
}
