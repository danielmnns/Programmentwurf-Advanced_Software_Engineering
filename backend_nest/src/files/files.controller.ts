import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Get('courseDocuments/:filename')
  async serveDocument(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = this.filesService.getFilePath('courseDocuments', filename);
      
      this.logger.debug(`Attempting to serve file: ${filePath}`);
      
      if (!this.filesService.fileExists(filePath)) {
        this.logger.error(`File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Set content disposition and type
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      
      // Create and return the file stream
      const fileStream = createReadStream(filePath);
      return fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error serving file: ${error.message}`);
      return res.status(500).json({ message: 'Error serving file' });
    }
  }

  @Get('taskDocuments/:filename')
  async serveTaskDocument(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveGenericFile('taskDocuments', filename, res);
  }

  @Get('submissions/:filename')
  async serveSubmission(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveGenericFile('submissions', filename, res);
  }

  private async serveGenericFile(directory: string, filename: string, res: Response) {
    try {
      const filePath = this.filesService.getFilePath(directory, filename);
      
      this.logger.debug(`Attempting to serve file: ${filePath}`);
      
      if (!this.filesService.fileExists(filePath)) {
        this.logger.error(`File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Set content disposition and type
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      
      // Create and return the file stream
      const fileStream = createReadStream(filePath);
      return fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error serving file: ${error.message}`);
      return res.status(500).json({ message: 'Error serving file' });
    }
  }
}

// Neuer verbesserter UploadsController für den direkten Dateizugriff
@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly filesService: FilesService) {}

  // Einfache Route für den direkten Zugriff auf einzelne Dateien
  @Get(':directory/:filename')
  async serveFile(
    @Param('directory') directory: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    try {
      this.logger.debug(`Requested file from uploads/${directory}/${filename}`);
      
      const filePath = this.filesService.getFilePath(directory, filename);
      
      this.logger.debug(`Full file path: ${filePath}`);
      
      if (!this.filesService.fileExists(filePath)) {
        this.logger.error(`File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Korrekten Content-Type für PDFs setzen
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      
      // Datei als Stream senden
      const fileStream = createReadStream(filePath);
      return fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error serving file: ${error.message}`, error.stack);
      return res.status(500).json({ 
        message: 'Error serving file', 
        error: error.message 
      });
    }
  }
}