import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS aktivieren für Frontend-Kommunikation
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Globale Prefix für alle API-Endpunkte
  app.setGlobalPrefix('api');
  
  // Validierung für alle eingehenden Requests
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();