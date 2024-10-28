using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Domains
{
    public class WikiData
    {
        public string Schema { get; set; }

        public long Id { get; set; }

        public string Type { get; set; }

        public int Namespace { get; set; }

        public string Title { get; set; }

        public string TitleUrl { get; set; }

        public string Comment { get; set; }

        public string Domain { get; set; }

        public long Timestamp { get; set; }

        public string User { get; set; }

        public bool Bot { get; set; }

        public string NotifyUrl { get; set; }

        public bool Minor { get; set; }

        public bool Patrolled { get; set; }

        public string ServerUrl { get; set; }

        public string ServerName { get; set; }

        public string ServerScriptPath { get; set; }

        public string Wiki { get; set; }

        public string ParsedComment { get; set; }
    }
}
