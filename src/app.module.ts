import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: 
  [
	  ElasticsearchModule.register
	  ({
		  node: "http://localhost:9200"
	  })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
