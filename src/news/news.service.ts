import { Injectable, HttpService } from "@nestjs/common";

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI('0b7980368ebf47b3af2442d6d788edf7');
var cheerio = require('cheerio');
var request = require('request');

@Injectable()
export class NewsService 
{
	constructor(private readonly httpService: HttpService) {}
	// Fetching the headlines
	async getHeadlines()
	{
		const headlines = await newsapi.v2.topHeadlines
		({
			language: "en",
			country: "in",
			pageSize: 100
		});

		return(headlines);
	}

	// Fetching the news per category
	async getNews(category: string)
	{
		const news = await newsapi.v2.topHeadlines
		({
			language: "en",
			country: "in",
			pageSize: 100,
			category: category
		});

		return(news);
	}

	async scrape(url: string, tag: string)
	{		
		var merged = "";

		var html = await this.httpService.get(url).toPromise();

		var $ = cheerio.load(html.data);
								
		merged = $(tag).html();			
		
		return(merged);
	}
}
