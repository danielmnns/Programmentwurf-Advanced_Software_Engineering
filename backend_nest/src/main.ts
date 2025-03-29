import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as fs from 'fs';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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

    // Create uploads directories if they don't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    const courseDocumentsDir = join(uploadsDir, 'courseDocuments');
    const submissionsDir = join(uploadsDir, 'submissions');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
      console.log(`Created directory: ${uploadsDir}`);
    }
    
    if (!fs.existsSync(courseDocumentsDir)) {
      fs.mkdirSync(courseDocumentsDir);
      console.log(`Created directory: ${courseDocumentsDir}`);
    }
    
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir);
      console.log(`Created directory: ${submissionsDir}`);
    }

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}
bootstrap();