import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

var sha1 = require("sha1");

@Injectable()
export class ElasticService 
{
	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	// Insert the data to the db.
	async insert(index: string, data: any, category: string)
	{
		let bulkBody = [];

		data.forEach((item) => 
		{
			item["category"] = category;
			item["notified"] = 0;

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
			body: bulkBody,			
		});		

		return(insertedNews);
	}

	async fetch(index: string, categories: string[])
	{
		const result = await this.elasticsearchService.search
		({
			index: "news",
			size:200,
			body: 
			{
				"sort": 
				[
					{
						"publishedAt": 
						{
							"order": "desc"
						}
					}
				]				
			}
		});

		return(result.body.hits.hits);
	}

	async fetchToNotify()
	{
		const result = await this.elasticsearchService.search
		({
			index: "news",
			size: 1,
			body:
			{
				query:
				{
					match: 
					{
						"notified": 0
					}
				}
			}
		});

		const response = result.body.hits.hits;
		const docId = response[0]["_id"];

		const updateResponse = await this.elasticsearchService.update
		({
			index: "news",
			id: docId,
			body:
			{
				script: 
				{
					source: 'ctx._source["notified"] = 1'
				}
			}
		});

		console.log(updateResponse);

		return(result.body.hits.hits);
	}
	
	async fetchCategories()
	{
		const result = await this.elasticsearchService.search
		({
			index: "category",
			size:10,
		});		

		return(result.body.hits.hits);
	}

	async search(term: string)
	{
		const { body } = await this.elasticsearchService.search
		({
			index: "news",			
			body: 
			{
				sort: 
				[
					{
						"publishedAt": 
						{
							"order": "desc"
						}
					}
				],
				query: 
				{					
					query_string: 
					{
						query: term
					}
				}
			}	
		});

		console.log(body);

		return(body.hits.hits);
	}
}