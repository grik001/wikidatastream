using Common.Models.Data;
using Common.Models.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Dtos.Mapper
{
    public class MongoWikiDataModelToWikiDataDtoMapper
    {
        public static WikiDataDto MapToMongo(MongoWikiDataModel streamData)
        {
            return new WikiDataDto
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
