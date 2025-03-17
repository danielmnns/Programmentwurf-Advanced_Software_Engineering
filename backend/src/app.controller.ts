import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
  
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'LMS Backend API',
    };
  }
  
  @Get('api')
  getApiInfo() {
    return {
      name: 'LMS API',
      version: '1.0.0',
      description: 'Learning Management System API',
    };
  }
}