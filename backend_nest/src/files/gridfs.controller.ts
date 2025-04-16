import { Controller, Delete, Get, Logger, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GridFSService } from './gridfs.service';

@Controller('gridfs')
export class GridFSController {
  private readonly logger = new Logger(GridFSController.name);

  constructor(private readonly gridFSService: GridFSService) {}

  // Datei aus GridFS abrufen und als Response zurückgeben
  @Get('file/:fileId')
  async getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      await this.gridFSService.readFile(fileId, res);
    } catch (error) {
      this.logger.error(`Error serving file ${fileId}: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Fehler beim Abrufen der Datei', error: error.message });
      }
    }
  }

  // Datei aus GridFS löschen (nur für Administratoren, Dozenten und Kursleiter)
  @Delete('file/:fileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async deleteFile(@Param('fileId') fileId: string) {
    try {
      const result = await this.gridFSService.deleteFile(fileId);
      return { success: result, message: 'Datei erfolgreich gelöscht' };
    } catch (error) {
      this.logger.error(`Error deleting file ${fileId}: ${error.message}`);
      return { success: false, message: 'Fehler beim Löschen der Datei', error: error.message };
    }
  }

  // Dateien nach Metadaten suchen
  @Get('files/by-type/:type')
  @UseGuards(JwtAuthGuard)
  async getFilesByType(@Param('type') type: string) {
    try {
      const files = await this.gridFSService.findFilesByMetadata({ type });
      return { files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        contentType: file.contentType,
        metadata: file.metadata,
        uploadDate: file.uploadDate
      })) };
    } catch (error) {
      this.logger.error(`Error finding files by type ${type}: ${error.message}`);
      return { success: false, message: 'Fehler beim Suchen nach Dateien', error: error.message };
    }
  }
}