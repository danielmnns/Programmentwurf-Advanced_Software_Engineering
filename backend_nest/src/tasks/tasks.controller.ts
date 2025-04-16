import { BadRequestException, Body, Controller, Get, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from '../courses/courses.service';
import { GridFSService } from '../files/gridfs.service';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly coursesService: CoursesService,
    private readonly gridFsService: GridFSService
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
  @Post('submit')
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
    }
  }))
  async uploadSubmission(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskName: string },
    @Req() req
  ) {
    if (!file) {
      throw new BadRequestException('Keine Datei gefunden');
    }

    // Speichere die Datei in GridFS
    const fileData = await this.gridFsService.storeFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        type: 'submission',
        courseName: body.courseName,
        taskName: body.taskName,
        userName: req.user.username
      }
    );

    return this.tasksService.createSubmission(
      body.courseName, 
      body.taskName, 
      req.user.username, 
      {
        originalname: file.originalname,
        id: fileData.id,
      }
    );
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
  @UseInterceptors(FileInterceptor('file'))
  async addTaskDocument(
    @UploadedFile() file,
    @Body() body: { courseName: string; taskId: string }
  ) {
    if (!file) {
      throw new BadRequestException('Keine Datei gefunden');
    }

    // Speichere die Datei in GridFS
    const fileData = await this.gridFsService.storeFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        type: 'taskDocument',
        courseName: body.courseName,
        taskId: body.taskId
      }
    );

    return this.tasksService.addDocumentToTask(
      body.courseName,
      body.taskId,
      {
        originalname: file.originalname,
        id: fileData.id,
      }
    );
  }

  @Post('admin/addTask')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  @UseInterceptors(FileInterceptor('file'))
  async addTask(
    @UploadedFile() file,
    @Body() taskData: any
  ) {
    try {
      // Defensive: taskDescription MUSS ein String sein
      if (typeof taskData.taskDescription !== 'string') {
        // Falls es ein Objekt ist (z.B. durch fehlerhafte Übertragung), versuche zu konvertieren
        if (taskData.taskDescription && typeof taskData.taskDescription === 'object') {
          taskData.taskDescription = JSON.stringify(taskData.taskDescription);
        } else {
          taskData.taskDescription = String(taskData.taskDescription ?? '');
        }
      }
      // Debug-Log für Typ und Wert
      console.log('Typ taskDescription:', typeof taskData.taskDescription, 'Wert:', taskData.taskDescription);
      console.log('Neue Aufgabe wird hinzugefügt:', taskData);
      console.log('Datei:', file ? file.originalname : 'keine');
      
      // Expliziter Debug-Log für die Beschreibung
      console.log('Aufgabenbeschreibung:', taskData.taskDescription);
      
      let fileData = null;
      
      if (file) {
        // Speichere die Datei in GridFS
        fileData = await this.gridFsService.storeFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          {
            type: 'task',
            courseName: taskData.courseName,
            taskName: taskData.taskName
          }
        );
      }
      
      const task = await this.tasksService.createTask(
        taskData.courseName,
        taskData.taskName,
        taskData.taskDescription,
        fileData ? {
          originalname: file.originalname,
          id: fileData.id
        } : null
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