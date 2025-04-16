import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CoursesModule } from '../courses/courses.module';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { FilesModule } from '../files/files.module';
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
    FilesModule,
    MulterModule.register({
      storage: memoryStorage()
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}