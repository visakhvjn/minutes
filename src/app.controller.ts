import { Controller, Get, Headers, InternalServerErrorException, Post, Body, Param } from "@nestjs/common";
import { ElasticService } from "./elastic.service";
import { NewsService } from "./news/news.service";
import { FCMService } from "./fcm.service";

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

	constructor(private readonly elasticService: ElasticService, private readonly newsService: NewsService, private readonly fcm: FCMService) {}

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
			const inserted = await this.elasticService.insert("news", articles, "headlines");

			this.response.status = 200;
			this.response.apiCount = articles.length;
			this.response.message = "News inserted!";
			this.response.data = inserted;

			this.sendFcm(); // To notify user.
		}

		return(this.response);
	}

	@Get("create/:category")
	async createNews(@Param("category") category: any)
	{
		const news = await this.newsService.getNews(category);

		const parsedNews = JSON.parse(JSON.stringify(news));

		if (parsedNews.status == "ok")
		{
			const articles = parsedNews.articles;

			// Save the headlines to elastic-search.
			const inserted = await this.elasticService.insert("news", articles, category);

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
		const results = await this.elasticService.fetch("news", ["headlines"]);
		
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

	@Post("fetch")
	async fetchNews(@Body() body: any)
	{
		let request = body.categories;

		var categories = ["headlines"];

		request.forEach((category) => 
		{
			categories.push(category);
		});

		const results = await this.elasticService.fetch("news", categories);

		if (results)
		{
			this.response.status = 200;
			this.response.message = "News fetched!";
			this.response.data = results;
		}

		return(this.response);
	}
	
	// Used to send general notifications.
	async sendFcm()
	{
		await this.fcm.send("Minutes - The Indian News App", "Stay up-to-date with the latest news just in!");
	}
}