import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

var sha1 = require("sha1");

@Injectable()
export class ElasticService 
{
	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	// Insert the data to the db.
	async insert(index: string, type: string, data: any)
	{
		let bulkBody = [];

		data.forEach((item) => 
		{
			console.log(item.title + "+" + item.publishedAt + "=" + sha1(item.title + item.publishedAt));

			bulkBody.push
			({
				index: 
				{
					_index: index,
					_id: sha1(item.title + item.publishedAt)
				}
			});

			bulkBody.push(item);
		});

		const insertedNews = await this.elasticsearchService.bulk
		({
			index: "news",
			refresh: "true",
			body: bulkBody
		});		

		return(insertedNews);
	}

	async fetch(index: string)
	{
		const result = await this.elasticsearchService.search
		({
			index: "news",
			size:1000
		});		

		return(result.body.hits.hits);
	}
}