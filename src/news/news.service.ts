import { Injectable } from "@nestjs/common";

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI('db90a434a04b4d9ba64070c668e90194');

@Injectable()
export class NewsService 
{		
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
}
