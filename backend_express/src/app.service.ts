import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Willkommen bei der Learning Management System API',
      documentation: '/api',
    };
  }
}