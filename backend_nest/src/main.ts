import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
        
    const message = 
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : 'Interner Serverfehler';
          
    // Detaillierte Fehlerinfos loggen
    this.logger.error(
      `Fehler [${status}] ${message}`,
      exception instanceof Error ? exception.stack : '',
      `Route: ${request.method} ${request.url}`,
    );
    
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      // Bei 500er-Fehlern mehr Infos bereitstellen
      this.logger.error(`Request body: ${JSON.stringify(request.body)}`);
      this.logger.error(`Request params: ${JSON.stringify(request.params)}`);
      this.logger.error(`Request query: ${JSON.stringify(request.query)}`);
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
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
  const taskDocumentsDir = join(uploadsDir, 'taskDocuments');
  const tasksDir = join(uploadsDir, 'tasks');
  
  // Stellen Sie sicher, dass alle Verzeichnisse existieren
  const directories = [
    uploadsDir,
    courseDocumentsDir,
    submissionsDir,
    taskDocumentsDir,
    tasksDir
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.log(`Created directory: ${dir}`);
    }
  });
  
  // Globaler Exception Filter für bessere Fehlerdiagnose
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
  logger.log(`Application is running on: http://localhost:3000/api`);
}

bootstrap();