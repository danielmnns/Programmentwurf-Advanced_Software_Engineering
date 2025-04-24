import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import * as mongoose from 'mongoose';
import { Connection, Types } from 'mongoose';
import { Stream } from 'stream';

@Injectable()
export class GridFSService {
  private readonly logger = new Logger(GridFSService.name);
  private bucket: mongoose.mongo.GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    // Initialisiere GridFS Bucket mit MongoDB
    this.bucket = new mongoose.mongo.GridFSBucket(this.connection.db, {
      bucketName: 'uploads'
    });
    
    this.logger.log('GridFS service initialized successfully');
  }

  // Speichert einen Buffer in MongoDB GridFS und gibt die ID und den Dateinamen zurück
  async storeFile(buffer: Buffer, filename: string, contentType: string, metadata: any = {}): Promise<{ id: string, filename: string }> {
    try {
      // Erstelle einen Readstream aus dem Buffer
      const readStream = new Stream.Readable();
      readStream.push(buffer);
      readStream.push(null); // Signalisiert das Ende des Streams
      
      // Erstelle eine eindeutige ID für die Datei
      const fileId = new Types.ObjectId();
      
      // Speichere die Datei in GridFS
      const uploadStream = this.bucket.openUploadStreamWithId(
        fileId,
        filename,
        {
          contentType,
          metadata
        }
      );
      
      // Promise für das Upload erstellen
      return new Promise((resolve, reject) => {
        readStream
          .pipe(uploadStream)
          .on('error', (error) => {
            this.logger.error(`Error storing file in GridFS: ${error.message}`);
            reject(new Error(`Fehler beim Speichern der Datei: ${error.message}`));
          })
          .on('finish', () => {
            this.logger.log(`File stored successfully in GridFS with ID: ${fileId}`);
            resolve({
              id: fileId.toString(),
              filename
            });
          });
      });
    } catch (error) {
      this.logger.error(`Error storing file: ${error.message}`);
      throw new Error(`Fehler beim Speichern der Datei: ${error.message}`);
    }
  }

  // Liest eine Datei aus GridFS und sendet sie als Response
  async readFile(fileId: string, res: Response): Promise<void> {
    try {
      // Konvertiere die ID-Zeichenkette zu ObjectId
      const objectId = new Types.ObjectId(fileId);
      
      // Finde die Dateimetadaten
      const files = await this.connection.db.collection('uploads.files').findOne({ _id: objectId });
      
      if (!files) {
        this.logger.warn(`File with id ${fileId} not found in GridFS`);
        res.status(404).json({ message: 'File not found' });
        return;
      }
      
      // Setze Response-Header
      res.set('Content-Type', files.contentType);
      res.set('Content-Disposition', `inline; filename="${files.filename}"`);
      
      // Streame die Datei zum Client
      const downloadStream = this.bucket.openDownloadStream(objectId);
      
      downloadStream.on('error', (error) => {
        this.logger.error(`Error streaming file ${fileId}: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error reading file', error: error.message });
        }
      });
      
      downloadStream.pipe(res);
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
      const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
      
      // Suche nach dem Dateieintrag in der files Collection
      const fileInfo = await this.connection.db.collection('uploads.files').findOne({ _id: objectId });
      
      if (!fileInfo) {
        return null;
      }
      
      return {
        _id: fileInfo._id.toString(),
        filename: fileInfo.filename,
        contentType: fileInfo.contentType,
        metadata: fileInfo.metadata,
        uploadDate: fileInfo.uploadDate,
        length: fileInfo.length
      };
    } catch (error) {
      this.logger.error(`Error finding file: ${error.message}`);
      throw new Error(`Fehler beim Suchen der Datei: ${error.message}`);
    }
  }

  // Löscht eine Datei aus GridFS
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const objectId = new Types.ObjectId(fileId);
      
      // Prüfe, ob die Datei existiert
      const file = await this.connection.db.collection('uploads.files').findOne({ _id: objectId });
      if (!file) {
        this.logger.warn(`File with id ${fileId} not found in GridFS`);
        return false;
      }
      
      // Lösche die Datei
      await this.bucket.delete(objectId);
      
      this.logger.log(`File ${fileId} deleted successfully from GridFS`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new Error(`Fehler beim Löschen der Datei: ${error.message}`);
    }
  }

  // Sucht Dateien nach Metadaten
  async findFilesByMetadata(metadataQuery: any): Promise<any[]> {
    try {
      // Erstelle eine MongoDB-Abfrage für Metadaten
      const query = {};
      
      // Transformiere die einfachen Schlüssel-Wert-Paare zu MongoDB-Metadatenpfaden
      for (const [key, value] of Object.entries(metadataQuery)) {
        query[`metadata.${key}`] = value;
      }
      
      // Führe die Abfrage aus
      const files = await this.connection.db
        .collection('uploads.files')
        .find(query)
        .toArray();
      
      // Transformiere die Ergebnisse zum erwarteten Format
      return files.map(file => ({
        _id: file._id.toString(),
        filename: file.filename,
        contentType: file.contentType,
        metadata: file.metadata,
        uploadDate: file.uploadDate,
        length: file.length
      }));
    } catch (error) {
      this.logger.error(`Error searching files: ${error.message}`);
      throw new Error(`Fehler bei der Dateisuche: ${error.message}`);
    }
  }
}