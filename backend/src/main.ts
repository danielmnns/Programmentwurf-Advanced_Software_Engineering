import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS aktivieren
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // API-Präfix ist nur "api", nicht "api/auth" wie standardmäßig für AuthModule
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();