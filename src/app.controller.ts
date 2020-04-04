import { Controller, Get, Headers, InternalServerErrorException, Post } from "@nestjs/common";
import { ElasticService } from "./elastic.service";
import { NewsService } from "./news/news.service";

@Controller("news")
export class AppController 
{
	private response = 
	{
		status: 500,
		message: "",
		apiCount:0,
		data: {}
	}

	constructor(private readonly elasticService: ElasticService, private readonly newsService: NewsService) {}

	@Get("headlines/create")
	async create()
	{
		// Fetch the headlines from the news API.
		const news = await this.newsService.getHeadlines();

		const parsedNews = JSON.parse(JSON.stringify(news));

		if (parsedNews.status == "ok")
		{
			const articles = parsedNews.articles;

			// Save the headlines to elastic-search.
			const inserted = await this.elasticService.insert("news", "headlines", articles);

			this.response.status = 200;
			this.response.apiCount = articles.length;
			this.response.message = "News inserted!";
			this.response.data = inserted;
		}

		return(this.response);
	}

	@Post("headlines/fetch")
	async fetch(@Headers() head: any)
	{
		console.log(head);

		const results = await this.elasticService.fetch("news");

		if (results)
		{
			this.response.status = 200;
			this.response.message = "News fetched!";
			this.response.data = results;
		}
		else 
		{
			throw new InternalServerErrorException("Invalid params sent!");
		}

		return(this.response);
	}
}