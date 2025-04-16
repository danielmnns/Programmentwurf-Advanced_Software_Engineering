import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController, UploadsController } from './files.controller';
import { FilesService } from './files.service';
import { GridFSController } from './gridfs.controller';
import { GridFSService } from './gridfs.service';

@Module({
  imports: [
    MongooseModule.forFeature([])
  ],
  controllers: [FilesController, UploadsController, GridFSController],
  providers: [FilesService, GridFSService],
  exports: [FilesService, GridFSService],
})
export class FilesModule {}