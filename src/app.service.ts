import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class AppService 
{
	constructor(private readonly elasticsearchService: ElasticsearchService)
	{

	}

	async getResults()
	{
		const {body} = await this.elasticsearchService.search
		({
			index: "got",
			body: 
			{
				query: 
				{
					match: 
					{
						quote: "Winter is coming"
					}
				}
			}		
		});

		console.log(body.hits.hits);
	}

	async index()
	{
		await this.elasticsearchService.index
		({
			index: "got",
			body: 
			{
				character: "Ned StarK",
				quote: "Winter is coming"
			}
		});

		await this.elasticsearchService.indices.refresh({index: "got"});
	}
}