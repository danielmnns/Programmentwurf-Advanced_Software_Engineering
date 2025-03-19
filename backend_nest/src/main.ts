import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
    app.setGlobalPrefix('api');
  
  // CORS für das Angular-Frontend konfigurieren
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });
  
  // Validierung für DTOs aktivieren
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));
  
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}
bootstrap();