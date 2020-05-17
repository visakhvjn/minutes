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

			console.log(articles);

			// Save the headlines to elastic-search.
			const inserted = await this.elasticService.insert("news", articles, "headlines");

			this.response.status = 200;
			this.response.apiCount = articles.length;
			this.response.message = "News inserted!";
			this.response.data = inserted;		
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
	@Get("fcm")
	async sendFcm()
	{
		const result = await this.elasticService.fetchToNotify();

		console.log(result);

		if (result)
		{
			await this.fcm.send
			(
				result["0"]["_source"]["title"], 
				result["0"]["_source"]["description"], 
				result["0"]["_source"]["urlToImage"],
				result["0"]["_source"]["publishedAt"],
				result["0"]["_source"]["author"] == null? "" : result["0"]["_source"]["author"],
				result["0"]["_source"]["content"],
				result["0"]["_source"]["url"]
			);
		}
	}

	@Get("category/fetch")
	async fetchCategories()
	{
		const results = await this.elasticService.fetchCategories();

		if (results)
		{
			this.response.status = 200;
			this.response.message = "News fetched!";
			this.response.data = results;
		}

		return(this.response);
	}

	@Post("search")
	async search(@Body() body: any)
	{
		const result = await this.elasticService.search(body.search);

		if (result)
		{
			this.response.status = 200;
			this.response.message = "News found";
			this.response.data = result;
		}
		else 
		{
			this.response.status = 404;
			this.response.message = "We will get back to you on that topic. For now we have nothing.";			
		}

		return(this.response);
	}

	@Get("trending")
	async trending()
	{
		const results = await this.elasticService.trending();
		
		console.log(results.length);

		if (results.length)
		{
			this.response.status = 200;
			this.response.message = "Here are the top " + results.length + " searches trending at the moment. Go ahead and click them to see some interesting results that popped up";
			this.response.data = results;
		}
		else 
		{
			this.response.status = 500;
			this.response.message = "Hmm! that is strange. It seems the whole world is a little less curious at the moment. We hope everything gets back to normal";
			this.response.data = [];
		}

		return(this.response);
	}

	@Post("scrape")
	async scrape(@Body() body:any)
	{
		var url = body.url;
		var tag = body.tag;

		var config = await this.elasticService.fetchScraperConfig(tag);

		const description = await this.newsService.scrape(url, config);

		if (description != "")
		{
			this.response.status = 200;
			this.response.message = "Fetched";
			this.response.data = description;
		}

		return(this.response);
	}
}