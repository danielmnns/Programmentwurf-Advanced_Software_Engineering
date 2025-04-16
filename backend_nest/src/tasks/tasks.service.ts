import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { GridFSService } from '../files/gridfs.service';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly gridFsService: GridFSService,
  ) {}

  async createTask(courseName: string, taskName: string, taskDescription: string, file: any): Promise<TaskDocument> {
    const existingTask = await this.taskModel.findOne({
      courseName,
      taskName,
    }).exec();

    if (existingTask) {
      throw new BadRequestException(`Aufgabe ${taskName} existiert bereits im Kurs ${courseName}`);
    }

    const documents = [];
    if (file) {
      documents.push({
        name: file.originalname,
        fileId: file.id,
      });
    }

    // Erstelle taskData Objekt für die Aufgabe
    const taskData = {
      courseName,
      taskName,
      taskDescription,
      documents,
      submissions: []
    };

    try {
      // Direkte Erstellung des Models ohne Prüfung des constructors
      const task = new this.taskModel(taskData);
      return await task.save();
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      throw new BadRequestException(`Fehler beim Erstellen der Aufgabe: ${error.message}`);
    }
  }

  async getTaskDetailsForStudent(courseName: string, taskName: string, username: string): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      taskName
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
    }

    // Suche nach Abgaben des aktuellen Studenten
    const userSubmission = task.submissions.find(sub => sub.userName === username);

    return {
      taskId: task._id,
      taskName: task.taskName,
      description: task.taskDescription,
      documents: task.documents.map(doc => ({
        name: doc.name,
        url: `/api/gridfs/file/${doc.fileId}`
      })),
      submission: userSubmission ? {
        ...userSubmission,
        file: userSubmission.file ? {
          name: userSubmission.file.name,
          url: `/api/gridfs/file/${userSubmission.file.fileId}`
        } : null
      } : null
    };
  }

  async createSubmission(courseName: string, taskName: string, username: string, file: any): Promise<any> {
    try {
      const task = await this.taskModel.findOne({
        courseName,
        taskName,
      }).exec();
  
      if (!task) {
        throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
      }
  
      // Prüfen ob der Benutzer bereits eine Abgabe hat
      const existingSubmissionIndex = task.submissions.findIndex(sub => sub.userName === username);
      
      const submission = {
        userName: username,
        file: {
          name: file.originalname,
          fileId: file.id,
        },
      };
  
      if (existingSubmissionIndex >= 0) {
        // Alte Datei löschen, wenn vorhanden
        const oldSubmission = task.submissions[existingSubmissionIndex];
        if (oldSubmission.file && oldSubmission.file.fileId) {
          try {
            await this.gridFsService.deleteFile(oldSubmission.file.fileId);
            console.log(`Alte Submission-Datei mit ID ${oldSubmission.file.fileId} gelöscht`);
          } catch (err) {
            console.error(`Fehler beim Löschen der alten Datei mit ID ${oldSubmission.file.fileId}:`, err);
          }
        }
        // Bestehende Abgabe aktualisieren
        task.submissions[existingSubmissionIndex] = submission;
      } else {
        // Neue Abgabe hinzufügen
        task.submissions.push(submission);
      }
  
      await task.save();
      return { 
        message: 'Abgabe erfolgreich gespeichert', 
        submission: {
          ...submission,
          file: {
            name: submission.file.name,
            url: `/api/gridfs/file/${submission.file.fileId}`
          }
        } 
      };
    } catch (error) {
      console.error('Fehler beim Speichern der Abgabe:', error);
      throw error;
    }
  }

  async getSubmissionsForTask(courseName: string, taskName: string): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
    }

    // Konvertiere URLs für die Anzeige im Frontend
    const submissionsWithUrls = task.submissions.map(sub => ({
      userName: sub.userName,
      file: sub.file ? {
        name: sub.file.name,
        url: `/api/gridfs/file/${sub.file.fileId}`
      } : undefined,
      feedback: sub.feedback
    }));

    return {
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      submissions: submissionsWithUrls
    };
  }

  // Füge diese Methode zum TasksService hinzu:
  async deleteSubmissionForUser(courseName: string, taskName: string, username: string): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      taskName,
    }).exec();
  
    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
    }
  
    // Finde den Index der Benutzerabgabe
    const submissionIndex = task.submissions.findIndex(sub => sub.userName === username);
    
    if (submissionIndex === -1) {
      throw new NotFoundException(`Keine Abgabe für Benutzer ${username} gefunden`);
    }
  
    // Lösche die alte Datei aus GridFS, wenn vorhanden
    const oldSubmission = task.submissions[submissionIndex];
    if (oldSubmission.file && oldSubmission.file.fileId) {
      try {
        await this.gridFsService.deleteFile(oldSubmission.file.fileId);
        console.log(`Submission-Datei mit ID ${oldSubmission.file.fileId} gelöscht`);
      } catch (err) {
        console.error(`Fehler beim Löschen der Datei mit ID ${oldSubmission.file.fileId}:`, err);
      }
    }
    
    // Entferne die Einreichung aus dem Aufgabenobjekt
    task.submissions.splice(submissionIndex, 1);
    await task.save();
    
    return { message: 'Abgabe erfolgreich gelöscht' };
  }

  async saveFeedback(
    courseName: string,
    taskName: string,
    submissionName: string,
    studentName: string,
    feedbackText: string,
    feedbackBy: string
  ): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
    }

    // Suche die Einreichung des Studenten
    const submissionIndex = task.submissions.findIndex(
      sub => sub.userName === studentName && sub.file.name === submissionName
    );

    if (submissionIndex === -1) {
      throw new NotFoundException(`Abgabe von ${studentName} für Aufgabe ${taskName} nicht gefunden`);
    }

    // Feedback hinzufügen oder aktualisieren
    task.submissions[submissionIndex].feedback = {
      text: feedbackText,
      feedbackFrom: feedbackBy
    };

    await task.save();

    return { 
      message: 'Feedback erfolgreich gespeichert',
      feedback: task.submissions[submissionIndex].feedback
    };
  }

  async updateTask(taskData: any): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName: taskData.courseName,
      taskName: taskData.name
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskData.name} im Kurs ${taskData.courseName} nicht gefunden`);
    }

    // Aktualisiere die Aufgabenbeschreibung
    if (taskData.description) {
      task.taskDescription = taskData.description;
    }

    await task.save();
    return { message: 'Aufgabe erfolgreich aktualisiert' };
  }

  async deleteTask(courseName: string, taskId: string): Promise<any> {
    try {
      console.log(`Versuche Aufgabe zu löschen: courseId=${courseName}, taskId=${taskId}`);
      
      // Finde die Aufgabe
      const task = await this.taskModel.findOne({
        courseName,
        _id: taskId
      }).exec();
  
      if (!task) {
        throw new NotFoundException(`Aufgabe mit ID ${taskId} im Kurs ${courseName} nicht gefunden`);
      }
      
      console.log(`Aufgabe gefunden: ${task._id}, ${task.taskName}`);
      
      // Referenz im Kurs entfernen
      console.log(`Suche Kurs: ${courseName}`);
      const course = await this.courseModel.findOne({ 
        title: courseName // Statt courseName - Title ist der tatsächliche Feldname im Kurs-Schema
      }).exec();
      
      if (course && course.tasks) {
        console.log(`Kurs gefunden mit ${course.tasks.length} Aufgaben`);
        
        // Entferne die TaskID aus dem tasks-Array des Kurses
        const taskIndex = course.tasks.findIndex(t => {
          if (typeof t === 'string') {
            return t === taskId;
          } else if (t && t.taskId) {
            return t.taskId.toString() === taskId;
          }
          return false;
        });
        
        if (taskIndex !== -1) {
          console.log(`Entferne Aufgabe aus dem Kurs an Index ${taskIndex}`);
          course.tasks.splice(taskIndex, 1);
          await course.save();
          console.log('Kurs erfolgreich aktualisiert');
        } else {
          console.log(`Aufgabe nicht im Kurs gefunden`);
        }
      } else {
        console.log('Kurs nicht gefunden oder hat keine Aufgaben');
      }
  
      // Lösche alle zugehörigen Dokumente aus GridFS
      if (task.documents && task.documents.length > 0) {
        console.log(`Lösche ${task.documents.length} zugehörige Dokumente`);
        for (const doc of task.documents) {
          if (doc.fileId) {
            try {
              await this.gridFsService.deleteFile(doc.fileId);
              console.log(`Dokument mit ID ${doc.fileId} gelöscht`);
            } catch (err) {
              console.error(`Fehler beim Löschen der Datei mit ID ${doc.fileId}:`, err);
            }
          }
        }
      }
  
      // Lösche alle zugehörigen Submissions und deren Dateien
      if (task.submissions && task.submissions.length > 0) {
        console.log(`Lösche ${task.submissions.length} zugehörige Submissions`);
        for (const submission of task.submissions) {
          if (submission.file && submission.file.fileId) {
            try {
              await this.gridFsService.deleteFile(submission.file.fileId);
              console.log(`Submission-Datei mit ID ${submission.file.fileId} gelöscht`);
            } catch (err) {
              console.error(`Fehler beim Löschen der Submission-Datei mit ID ${submission.file.fileId}:`, err);
            }
          }
        }
      }
      
      // Jetzt die Aufgabe aus der Datenbank löschen - mit deleteOne für mehr Flexibilität
      const deleteResult = await this.taskModel.deleteOne({ _id: taskId }).exec();
      console.log(`Löschvorgang abgeschlossen: ${JSON.stringify(deleteResult)}`);
      
      if (deleteResult.deletedCount === 0) {
        throw new Error(`Aufgabe konnte nicht gelöscht werden`);
      }
  
      return { 
        message: 'Aufgabe erfolgreich gelöscht',
        deletedCount: deleteResult.deletedCount
      };
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      throw error;
    }
  }

  async addDocumentToTask(courseName: string, taskId: string, file: any): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      _id: taskId
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe mit ID ${taskId} im Kurs ${courseName} nicht gefunden`);
    }

    const newDocument = {
      name: file.originalname,
      fileId: file.id,
    };

    if (!task.documents) {
      task.documents = [];
    }

    task.documents.push(newDocument);
    await task.save();

    return { 
      message: 'Dokument erfolgreich zur Aufgabe hinzugefügt',
      document: {
        name: newDocument.name,
        url: `/api/gridfs/file/${newDocument.fileId}`
      }
    };
  }
}