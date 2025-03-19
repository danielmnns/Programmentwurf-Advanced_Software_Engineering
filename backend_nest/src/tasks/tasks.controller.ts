import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Für Studenten: Aufgabendetails und Abgabe abrufen
  @Get('tasks')
  @UseGuards(JwtAuthGuard)
  async getTaskDetails(@Body() payload: { courseName: string; taskName: string }, @Req() req) {
    return this.tasksService.getTaskDetailsForStudent(payload.courseName, payload.taskName, req.user.username);
  }

  // Abgabe hochladen
  @Post('tasks/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/submissions',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  async uploadSubmission(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskName: string },
    @Req() req
  ) {
    return this.tasksService.createSubmission(body.courseName, body.taskName, req.user.username, file);
  }

  // Admin-Route: Task hinzufügen
  @Post('admin/addTask')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  @UseInterceptors(FileInterceptor('files', {
    storage: diskStorage({
      destination: './uploads/tasks',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  async addTask(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskName: string; taskText: string }
  ) {
    return this.tasksService.createTask(body.courseName, body.taskName, body.taskText, file);
  }

  // Admin-Route: Abgaben anzeigen
  @Post('admin/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async getSubmissions(@Body() payload: { courseName: string; taskName: string }) {
    return this.tasksService.getSubmissionsForTask(payload.courseName, payload.taskName);
  }

  // Admin-Route: Feedback geben
  @Post('admin/feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async giveFeedback(
    @Body() payload: { 
      courseName: string; 
      taskName: string; 
      submissionName: string;
      studentName: string;
      feedbackText: string;
      feedbackBy: string;
    }
  ) {
    return this.tasksService.saveFeedback(
      payload.courseName,
      payload.taskName,
      payload.submissionName,
      payload.studentName,
      payload.feedbackText,
      payload.feedbackBy
    );
  }

  // Admin-Route: Task aktualisieren
  @Post('admin/updateTask')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async updateTask(@Body() taskData: any) {
    return this.tasksService.updateTask(taskData);
  }

  // Admin-Route: Task löschen
  @Post('admin/deleteTask')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async deleteTask(@Body() payload: { courseName: string; taskId: string }) {
    return this.tasksService.deleteTask(payload.courseName, payload.taskId);
  }

  // Admin-Route: Dokument zu einer Aufgabe hinzufügen
  @Post('admin/addTaskDocument')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/taskDocuments',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  // Füge diese Methode zum TasksController hinzu:

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async deleteSubmission(@Body() payload: { courseName: string; taskName: string }, @Req() req) {
    return this.tasksService.deleteSubmissionForUser(payload.courseName, payload.taskName, req.user.username);
  }
  async addTaskDocument(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskId: string }
  ) {
    return this.tasksService.addDocumentToTask(body.courseName, body.taskId, file);
  }
}