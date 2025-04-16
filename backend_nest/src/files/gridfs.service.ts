import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import * as fs from 'fs';
import { Connection, Types } from 'mongoose';
import * as path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class GridFSService {
  private readonly logger = new Logger(GridFSService.name);
  private readonly uploadsDir: string;
  private readonly metadataDir: string;

  constructor(@InjectConnection() private readonly connection: Connection) {
    // Erstelle Upload-Verzeichnisse
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.metadataDir = path.join(this.uploadsDir, 'metadata');
    
    // Stelle sicher, dass Verzeichnisse existieren
    this.ensureDirectoriesExist();
    
    this.logger.log('File service initialized successfully');
  }

  private async ensureDirectoriesExist() {
    for (const dir of [this.uploadsDir, this.metadataDir]) {
      if (!await existsAsync(dir)) {
        await mkdirAsync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    }
  }

  // Speichert einen Buffer im Dateisystem und gibt die ID und den Dateinamen zurück
  async storeFile(buffer: Buffer, filename: string, contentType: string, metadata: any = {}): Promise<{ id: string, filename: string }> {
    try {
      const fileId = randomUUID();
      const safeFilename = this.getSafeFilename(filename);
      const storedFilename = `${fileId}-${safeFilename}`;
      const filePath = path.join(this.uploadsDir, storedFilename);
      const metadataFilePath = path.join(this.metadataDir, `${fileId}.json`);

      // Speichere Datei
      await writeFileAsync(filePath, buffer);
      
      // Speichere Metadaten
      const fileMetadata = {
        id: fileId,
        originalFilename: filename,
        storedFilename,
        contentType,
        uploadDate: new Date(),
        metadata,
        size: buffer.length
      };
      await writeFileAsync(metadataFilePath, JSON.stringify(fileMetadata, null, 2));
      
      this.logger.log(`File stored successfully: ${filePath}`);
      return {
        id: fileId,
        filename: safeFilename
      };
    } catch (error) {
      this.logger.error(`Error storing file: ${error.message}`);
      throw new Error(`Fehler beim Speichern der Datei: ${error.message}`);
    }
  }

  // Liest eine Datei und sendet sie als Response
  async readFile(fileId: string, res: Response): Promise<void> {
    try {
      const metadataFilePath = path.join(this.metadataDir, `${fileId}.json`);
      
      if (!await existsAsync(metadataFilePath)) {
        this.logger.warn(`File metadata with id ${fileId} not found`);
        res.status(404).json({ message: 'File not found' });
        return;
      }
      
      const fileMetadata = JSON.parse(await fs.promises.readFile(metadataFilePath, 'utf8'));
      const filePath = path.join(this.uploadsDir, fileMetadata.storedFilename);
      
      if (!await existsAsync(filePath)) {
        this.logger.warn(`File with id ${fileId} not found on disk`);
        res.status(404).json({ message: 'File not found on disk' });
        return;
      }
      
      res.set('Content-Type', fileMetadata.contentType);
      res.set('Content-Disposition', `inline; filename="${fileMetadata.originalFilename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error reading file: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error reading file', error: error.message });
      }
    }
  }

  // Findet eine Datei nach ID
  async findFileById(id: Types.ObjectId | string): Promise<any> {
    try {
      const fileId = typeof id === 'string' ? id : id.toString();
      const metadataFilePath = path.join(this.metadataDir, `${fileId}.json`);
      
      if (!await existsAsync(metadataFilePath)) {
        return null;
      }
      
      const fileMetadata = JSON.parse(await fs.promises.readFile(metadataFilePath, 'utf8'));
      return {
        _id: fileId,
        filename: fileMetadata.originalFilename,
        contentType: fileMetadata.contentType,
        metadata: fileMetadata.metadata,
        uploadDate: fileMetadata.uploadDate
      };
    } catch (error) {
      this.logger.error(`Error finding file: ${error.message}`);
      throw new Error(`Fehler beim Suchen der Datei: ${error.message}`);
    }
  }

  // Löscht eine Datei
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const metadataFilePath = path.join(this.metadataDir, `${fileId}.json`);
      
      if (!await existsAsync(metadataFilePath)) {
        this.logger.warn(`File metadata with id ${fileId} not found`);
        return false;
      }
      
      const fileMetadata = JSON.parse(await fs.promises.readFile(metadataFilePath, 'utf8'));
      const filePath = path.join(this.uploadsDir, fileMetadata.storedFilename);
      
      if (await existsAsync(filePath)) {
        await unlinkAsync(filePath);
      }
      
      await unlinkAsync(metadataFilePath);
      this.logger.log(`File ${fileId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new Error(`Fehler beim Löschen der Datei: ${error.message}`);
    }
  }

  // Sucht Dateien nach Metadaten
  async findFilesByMetadata(metadataQuery: any): Promise<any[]> {
    try {
      const files = [];
      const metadataFiles = await fs.promises.readdir(this.metadataDir);
      
      for (const file of metadataFiles) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.metadataDir, file);
            const fileMetadata = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
            let match = true;
            
            // Prüfe, ob die Metadaten den Suchkriterien entsprechen
            for (const [key, value] of Object.entries(metadataQuery)) {
              if (!fileMetadata.metadata || fileMetadata.metadata[key] !== value) {
                match = false;
                break;
              }
            }
            
            if (match) {
              files.push({
                _id: fileMetadata.id,
                filename: fileMetadata.originalFilename,
                contentType: fileMetadata.contentType,
                metadata: fileMetadata.metadata,
                uploadDate: fileMetadata.uploadDate
              });
            }
          } catch (err) {
            this.logger.warn(`Error reading metadata file ${file}: ${err.message}`);
          }
        }
      }
      
      return files;
    } catch (error) {
      this.logger.error(`Error searching files: ${error.message}`);
      throw new Error(`Fehler bei der Dateisuche: ${error.message}`);
    }
  }

  // Hilfsmethode für sichere Dateinamen
  private getSafeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }

  // Methode zum Abrufen des Dateipfads für das FileSystem-basierte UploadsController
  getFilePath(directory: string, filename: string): string {
    return path.join(process.cwd(), 'uploads', directory, filename);
  }

  // Prüft, ob eine Datei existiert
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}