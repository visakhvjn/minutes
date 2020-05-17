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

		// Check if already searched.
		if (await this.searched(term))
		{
			await this.updateSearch(term);
		}
		else 
		{
			await this.addTrending(term);
		}

		return(body.hits.hits);
	}

	async searched(term: string)
	{
		var found = true;

		term = term.trim();
		term = term.toLowerCase();
		term = sha1(term);

		const { body } = await this.elasticsearchService.search
		({
			index: "trending",			
			body: 
			{				
				query: 
				{					
					term: 
					{
						"_id": 
						{
							"value": term
						}
					}
				}
			}
		});

		console.log("SERACHED?");
		console.log(body.hits.hits);
		
		if (!body.hits.hits.length)
		{
			found = false;
		}

		return(found);
	}

	async updateSearch(term)
	{
		console.log("UPdateing");

		var searchTerm = term; // The actual search term.

		term = term.trim();
		term = term.toLowerCase();
		term = sha1(term);

		// Update it's search counter.
		await this.elasticsearchService.update
		({
			index: "trending",
			id: term,
			body: 
			{
				script: 
				{
					source: 'ctx._source.counter++'
				}
			}
		});
	}

	async addTrending(term)
	{
		console.log("adddingnew");

		var id = term.trim();
		id = id.toLowerCase();
		id = sha1(id);

		await this.elasticsearchService.index
		({
			index: "trending",
			id: id,
			body: 
			{
				"searched": term,
				"counter": 1 
			}
		});

		return(0);
	}

	async trending()
	{
		const { body } = await this.elasticsearchService.search
		({
			index: "trending",	
			size: 5,		
			body: 
			{
				sort: 
				[
					{
						"counter": 
						{
							"order": "desc"
						}
					}
				]
			}	
		});

		console.log(body);

		return(body.hits.hits);
	}

	async fetchScraperConfig(tag)
	{
		console.log(tag);

		const { body } = await this.elasticsearchService.search
		({
			index: "scraper",	
			size: 1,		
			body: 
			{				
				query: 
				{					
					match:
					{
						"tag": tag
					}
				}
			}	
		});

		console.log(body);

		return(body.hits.hits[0]["_source"]["element"]);
	}
}