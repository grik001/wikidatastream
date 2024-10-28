using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Domains
{
    public class HubWikiStatData
    {
        public long Id { get; set; }

        public string Type { get; set; }

        public int Namespace { get; set; }

        public string Domain { get; set; }

        public long Timestamp { get; set; }
    }
}
