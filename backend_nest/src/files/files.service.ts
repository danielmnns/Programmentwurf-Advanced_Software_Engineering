import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  getFilePath(directory: string, filename: string): string {
    // Check if filename has any path traversal characters
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    return join(process.cwd(), 'uploads', directory, filename);
  }

  fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      this.logger.error(`Error checking if file exists: ${error.message}`);
      return false;
    }
  }
}