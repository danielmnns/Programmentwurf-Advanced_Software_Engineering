import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoursesModule } from '../courses/courses.module';
import { Course, CourseSchema } from '../courses/schemas/course.schema'; // Import hinzufügen
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: Course.name, schema: CourseSchema }
    ]),
    CoursesModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Stellen Sie sicher, dass das Unterverzeichnis existiert
          const uploadsDir = './uploads';
          const submissionsDir = './uploads/submissions';
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
          }
          
          if (!fs.existsSync(submissionsDir)) {
            fs.mkdirSync(submissionsDir);
          }
          
          cb(null, submissionsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB in Bytes
      },
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}