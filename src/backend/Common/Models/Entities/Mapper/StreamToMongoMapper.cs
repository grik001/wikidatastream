using Common.Models.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Data.Mapper
{
    public static class StreamToMongoMapper
    {
        public static MongoWikiDataModel MapToMongo(WikiData streamData)
        {
            return new MongoWikiDataModel
            {
                Schema = streamData.Schema,
                Id = streamData.Id,
                Type = streamData.Type,
                Namespace = streamData.Namespace,
                Title = streamData.Title,
                TitleUrl = streamData.TitleUrl,
                Comment = streamData.Comment,
                Domain = streamData.Domain,
                Timestamp = streamData.Timestamp,
                User = streamData.User,
                Bot = streamData.Bot,
                NotifyUrl = streamData.NotifyUrl,
                Minor = streamData.Minor,
                Patrolled = streamData.Patrolled,
                ServerUrl = streamData.ServerUrl,
                ServerName = streamData.ServerName,
                ServerScriptPath = streamData.ServerScriptPath,
                Wiki = streamData.Wiki,
                ParsedComment = streamData.ParsedComment
            };
        }
    }
}
