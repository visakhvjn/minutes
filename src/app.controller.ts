import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("app")
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post("init")
  async init()
  {
	  await this.appService.getResults();
  }

  @Post("index")
  async initIndex()
  {
	  await this.appService.index();
  }
}
