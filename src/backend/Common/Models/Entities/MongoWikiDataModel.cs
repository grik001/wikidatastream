using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace Common.Models.Data
{
    public class MongoWikiDataModel
    {
        public string Schema { get; set; }

        [BsonId]
        public long Id { get; set; }  // Keeping Id as long to match the stream model

        public string Type { get; set; }

        public int Namespace { get; set; }

        public string Title { get; set; }

        public string TitleUrl { get; set; }

        public string Domain { get; set; }

        public string Comment { get; set; }

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