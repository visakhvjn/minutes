import { Injectable } from "@nestjs/common";

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI('0b7980368ebf47b3af2442d6d788edf7');

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
