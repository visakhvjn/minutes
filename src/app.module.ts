import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ElasticService } from './elastic.service';
import { NewsService } from './news/news.service';
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import Config from "./config/constants";

@Module({
  imports: 
  [
	  ElasticsearchModule.register
	  ({
		  node: Config.database.elastic.bonsai
	  })
  ],
  controllers: [AppController],
  providers: [ElasticService, NewsService],
})
export class AppModule {}
