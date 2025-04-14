import { BadRequestException, Body, Controller, Get, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from '../courses/courses.service';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly coursesService: CoursesService 
  ) {}

  // Spezifischer Endpunkt für Aufgabendetails (für Studenten)
  @Get('user-task')
  @UseGuards(JwtAuthGuard)
  async getUserTaskDetails(
    @Query('courseName') courseName: string,
    @Query('taskName') taskName: string,
    @Query('userName') userName: string
  ) {
    console.log(`Aufgabendetails abgerufen für: Kurs=${courseName}, Aufgabe=${taskName}, Benutzer=${userName}`);
    const taskDetails = await this.tasksService.getTaskDetailsForStudent(courseName, taskName, userName);
    console.log('Gefundene Aufgabendetails:', JSON.stringify(taskDetails, null, 2));
    return taskDetails;
  }
  
  // Aufgabendetails abrufen (allgemein)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getTaskDetails(@Body() payload: { courseName: string; taskName: string }, @Req() req) {
    return this.tasksService.getTaskDetailsForStudent(payload.courseName, payload.taskName, req.user.username);
  }

  // Abgabe hochladen
  @Post('upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB in Bytes
  },
  fileFilter: (req, file, callback) => {
    // Prüfe, ob es ein PDF ist
    if (file.mimetype !== 'application/pdf') {
      return callback(new BadRequestException('Nur PDF-Dateien sind erlaubt'), false);
    }
    callback(null, true);
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      const submissionsDir = './uploads/submissions';
      // Prüfe, ob Verzeichnis existiert, falls nicht, erstelle es
      if (!fs.existsSync(submissionsDir)) {
        fs.mkdirSync(submissionsDir, { recursive: true });
      }
      cb(null, submissionsDir);
    },
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
  if (!file) {
    throw new BadRequestException('Keine Datei gefunden');
  }
  return this.tasksService.createSubmission(body.courseName, body.taskName, req.user.username, file);
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
  async giveFeedback(@Body() payload: { 
      courseName: string; 
      taskName: string; 
      submissionName: string;
      studentName: string;
      feedbackText: string;
      feedbackBy: string;
    }) {
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
  async addTaskDocument(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskId: string }
  ) {
    return this.tasksService.addDocumentToTask(body.courseName, body.taskId, file);
  }

  @Post('admin/addTask')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  @UseInterceptors(FileInterceptor('file', {
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
    @Body() taskData: any
  ) {
    try {
      console.log('Neue Aufgabe wird hinzugefügt:', taskData);
      console.log('Datei:', file ? file.filename : 'keine');
      
      // Expliziter Debug-Log für die Beschreibung
      console.log('Aufgabenbeschreibung:', taskData.taskDescription);
      
      const task = await this.tasksService.createTask(
        taskData.courseName,
        taskData.taskName,
        taskData.taskDescription, // Hier den korrekten Feldnamen verwenden
        file
      );
      
      await this.coursesService.addTaskToCourse(taskData.courseName, task);
      
      console.log('Aufgabe erfolgreich erstellt und zum Kurs hinzugefügt:', task._id);
      
      return {
        success: true,
        message: 'Aufgabe erfolgreich erstellt',
        task: task
      };
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Abgabe löschen
  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async deleteSubmission(@Body() payload: { courseName: string; taskName: string }, @Req() req) {
    return this.tasksService.deleteSubmissionForUser(payload.courseName, payload.taskName, req.user.username);
  }
}