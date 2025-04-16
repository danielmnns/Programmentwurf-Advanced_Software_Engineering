import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridFSService } from '../files/gridfs.service';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly gridFsService: GridFSService
  ) {}

  async create(createCourseDto: any): Promise<CourseDocument> {
    const existingCourse = await this.courseModel.findOne({ title: createCourseDto.title }).exec();
    
    if (existingCourse) {
      throw new BadRequestException(`Kurs "${createCourseDto.title}" existiert bereits`);
    }
    
    // Initialisiere ein leeres Array für Dokumente
    const courseData = {
      ...createCourseDto,
      documents: [],
      tasks: [],
      participants: []
    };
    
    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel.find().exec();
  }

  async findOne(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
    
    return course;
  }

  async findByName(name: string): Promise<CourseDocument> {
    const course = await this.courseModel.findOne({ title: name }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${name}" nicht gefunden`);
    }
    
    return course;
  }

  async findCoursesForUser(username: string): Promise<CourseDocument[]> {
    return this.courseModel.find({ participants: username }).exec();
  }

  async update(id: string, updateCourseDto: any): Promise<CourseDocument> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
      
    if (!course) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
    
    return course;
  }

  async findCourseDetails(courseName: string): Promise<any> {
    console.log(`Kursdetails werden abgerufen für: ${courseName}`);
    
    // Verwende eine direkte Abfrage mit aktuellem Kontext anstatt findOne
    const course = await this.courseModel
      .findOne({ title: courseName })
      .lean()  // Wichtig: Verwende lean() um das reine JS-Objekt zu erhalten
      .exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }

    console.log(`Kurs gefunden: ${course._id}, Titel: ${course.title}`);
    console.log(`Tasks im Kurs vorhanden: ${course.tasks && course.tasks.length > 0 ? 'Ja' : 'Nein'}`);
    console.log(`Anzahl Tasks: ${course.tasks?.length || 0}`);
    
    if (course.tasks && course.tasks.length > 0) {
      console.log(`Tasks-Rohstruktur:`, JSON.stringify(course.tasks, null, 2));
    } else {
      console.log('Keine Tasks im Kurs gefunden.');
      
      // Direkte Datenbank-Prüfung zur Fehlerbehebung
      const freshCourse = await this.courseModel
        .findById(course._id)
        .exec();
      console.log(`Fresh Course Query - Tasks: ${freshCourse?.tasks?.length || 0}`);
    }

    // Konvertiere URLs für die Anzeige im Frontend
    const documentsWithUrls = (course.documents || []).map(doc => ({
      name: doc.name,
      url: `/api/gridfs/file/${doc.fileId}`
    }));

    // Erstelle explizit die Tasks-Struktur für das Frontend
    const tasksWithUrls = (course.tasks || []).map(task => {
      console.log(`Verarbeite Task: ${task.name || 'Unbekannt'}, ID: ${task.taskId}`);
      
      return {
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        documents: (task.documents || []).map(doc => ({
          name: doc.name,
          url: `/api/gridfs/file/${doc.fileId}`
        }))
      };
    });
    
    console.log(`Aufbereitete Taskliste für Frontend:`, JSON.stringify(tasksWithUrls, null, 2));
    
    return {
      title: course.title,
      textContent: course.textContent || '',
      documents: documentsWithUrls,
      tasks: tasksWithUrls,
      participants: course.participants || []
    };
  }

  async updateCourseText(courseName: string, textContent: string): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    course.textContent = textContent;
    await course.save();
    
    return { message: 'Kurstext erfolgreich aktualisiert' };
  }

  async addDocumentToCourse(courseName: string, file: any): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    const document = {
      name: file.originalname,
      fileId: file.id
    };
    
    if (!course.documents) {
      course.documents = [];
    }
    
    course.documents.push(document);
    await course.save();
    
    return { 
      message: 'Dokument erfolgreich zum Kurs hinzugefügt', 
      document: {
        name: document.name,
        url: `/api/gridfs/file/${document.fileId}`
      }
    };
  }

  async remove(id: string): Promise<void> {
    // Finde den Kurs zuerst, um alle zugehörigen Dateien zu löschen
    const course = await this.courseModel.findById(id).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
    
    // Lösche alle Dokumente aus GridFS
    if (course.documents && course.documents.length > 0) {
      for (const doc of course.documents) {
        try {
          await this.gridFsService.deleteFile(doc.fileId);
          console.log(`Kursdokument mit ID ${doc.fileId} gelöscht`);
        } catch (err) {
          console.error(`Fehler beim Löschen des Kursdokuments mit ID ${doc.fileId}:`, err);
        }
      }
    }
    
    // Jetzt den Kurs löschen
    const result = await this.courseModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
  }

  // Teilnehmer zu einem Kurs hinzufügen oder entfernen
  async updateCourseParticipants(userData: any): Promise<any> {
    const { courseId, username, action } = userData;
    
    if (!courseId || !username || !action) {
      throw new BadRequestException('Fehlende Parameter: courseId, username oder action');
    }
    
    const course = await this.courseModel.findOne({ title: courseId }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs "${courseId}" nicht gefunden`);
    }
    
    if (!course.participants) {
      course.participants = [];
    }

    if (action === 'add') {
      if (!course.participants.includes(username)) {
        course.participants.push(username);
      }
    } else if (action === 'remove') {
      course.participants = course.participants.filter(p => p !== username);
    } else {
      throw new BadRequestException('Ungültige Aktion. Erlaubt sind "add" oder "remove"');
    }
    
    await course.save();
    
    return { 
      message: `Benutzer ${action === 'add' ? 'hinzugefügt' : 'entfernt'}`, 
      participants: course.participants 
    };
  }

  async addTaskToCourse(courseName: string, task: any): Promise<CourseDocument> {
    console.log("Adding task to course:", courseName);
    console.log("Task object:", JSON.stringify(task, null, 2));
    
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    if (!course.tasks) {
      course.tasks = [];
    }
    
    // Extrahieren und protokollieren der Eigenschaften
    console.log("Task properties available:", Object.keys(task));
    console.log("Task description:", task.taskDescription);
    
    // Korrekte Aufgabenstruktur für das Frontend erstellen
    const taskToAdd = {
      taskId: task._id.toString(),
      name: task.taskName,
      description: task.taskDescription,
      documents: task.documents?.map(doc => ({
        name: doc.name,
        fileId: doc.fileId
      })) || []
    };
    
    course.tasks.push(taskToAdd);
    
    // Explizite Speicherung mit error-handling
    try {
      const savedCourse = await course.save();
      console.log("Course after save - tasks:", JSON.stringify(savedCourse.tasks, null, 2));
      return savedCourse;
    } catch (error) {
      console.error("Error saving course:", error);
      throw error;
    }
  }

  async removeDocumentFromCourse(courseName: string, documentName: string): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    const documentIndex = course.documents.findIndex(doc => doc.name === documentName);
    
    if (documentIndex === -1) {
      throw new NotFoundException(`Dokument "${documentName}" nicht gefunden im Kurs "${courseName}"`);
    }
    
    const document = course.documents[documentIndex];
    const fileId = document.fileId;
    
    // Entferne das Dokument aus dem Kurs
    course.documents.splice(documentIndex, 1);
    await course.save();
    
    // Lösche die Datei aus GridFS
    try {
      await this.gridFsService.deleteFile(fileId);
      console.log(`Dokument mit ID ${fileId} gelöscht`);
    } catch (error) {
      console.error(`Fehler beim Löschen der Datei mit ID ${fileId}:`, error.message);
    }
    
    return {
      message: `Dokument "${documentName}" erfolgreich gelöscht`,
      documentName
    };
  }
}