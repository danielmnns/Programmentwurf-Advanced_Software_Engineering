import { Module } from '@nestjs/common';
import { FilesController, UploadsController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  controllers: [FilesController, UploadsController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}