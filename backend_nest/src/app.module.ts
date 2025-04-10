import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CoursesModule } from './courses/courses.module';
import { FilesModule } from './files/files.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_db'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), 
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false 
      }
    }),
    FilesModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    TasksModule,
    CommonModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}