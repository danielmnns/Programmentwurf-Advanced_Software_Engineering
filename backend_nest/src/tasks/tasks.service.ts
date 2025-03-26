import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>
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
        url: `/uploads/tasks/${file.filename}`,
      });
    }

    const task = new this.taskModel({
      courseName,
      taskName,
      taskDescription,
      documents,
      submissions: []
    });

    return task.save();
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
      documents: task.documents,
      submission: userSubmission || null
    };
  }

  async createSubmission(courseName: string, taskName: string, username: string, file: any): Promise<any> {
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
        url: `/uploads/submissions/${file.filename}`,
      },
    };

    if (existingSubmissionIndex >= 0) {
      // Alte Datei löschen, wenn vorhanden
      const oldSubmission = task.submissions[existingSubmissionIndex];
      if (oldSubmission.file && oldSubmission.file.url) {
        const oldFilePath = path.join(__dirname, '..', '..', oldSubmission.file.url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Bestehende Abgabe aktualisieren
      task.submissions[existingSubmissionIndex] = submission;
    } else {
      // Neue Abgabe hinzufügen
      task.submissions.push(submission);
    }

    await task.save();
    return { message: 'Abgabe erfolgreich gespeichert', submission };
  }

  async getSubmissionsForTask(courseName: string, taskName: string): Promise<any> {
    const task = await this.taskModel.findOne({
      courseName,
      taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe ${taskName} im Kurs ${courseName} nicht gefunden`);
    }

    return {
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      submissions: task.submissions
    };
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
      message: `Feedback für ${studentName}s Abgabe erfolgreich gespeichert`,
      feedback: task.submissions[submissionIndex].feedback
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
  
    // Lösche die alte Datei, wenn vorhanden
    const oldSubmission = task.submissions[submissionIndex];
    if (oldSubmission.file && oldSubmission.file.url) {
      const filePath = path.join(__dirname, '..', '..', oldSubmission.file.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  
    task.submissions.splice(submissionIndex, 1);
    await task.save();
  
    return { message: 'Abgabe erfolgreich gelöscht' };
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
    const task = await this.taskModel.findOneAndDelete({
      courseName,
      _id: taskId
    }).exec();

    if (!task) {
      throw new NotFoundException(`Aufgabe mit ID ${taskId} im Kurs ${courseName} nicht gefunden`);
    }

    // Lösche auch alle zugehörigen Dateien
    if (task.documents && task.documents.length > 0) {
      task.documents.forEach(doc => {
        if (doc.url) {
          const filePath = path.join(__dirname, '..', '..', doc.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    // Lösche auch alle zugehörigen Einreichungen
    if (task.submissions && task.submissions.length > 0) {
      task.submissions.forEach(sub => {
        if (sub.file && sub.file.url) {
          const filePath = path.join(__dirname, '..', '..', sub.file.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    return { message: 'Aufgabe erfolgreich gelöscht' };
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
      url: `/uploads/taskDocuments/${file.filename}`,
    };

    if (!task.documents) {
      task.documents = [];
    }

    task.documents.push(newDocument);
    await task.save();

    return { 
      message: 'Dokument erfolgreich zur Aufgabe hinzugefügt',
      document: newDocument
    };
  }
}