import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>
  ) {}

  async create(createCourseDto: any): Promise<CourseDocument> {
    const existingCourse = await this.courseModel.findOne({ title: createCourseDto.title }).exec();
    if (existingCourse) {
      throw new BadRequestException(`Ein Kurs mit dem Titel "${createCourseDto.title}" existiert bereits`);
    }

    const createdCourse = new this.courseModel({
      title: createCourseDto.title,
      textContent: '',
      participants: [],
      documents: [],
      tasks: []
    });
    return createdCourse.save();
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

  async findCourseDetails(courseName: string): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    return {
      title: course.title,
      textContent: course.textContent,
      participants: course.participants,
      documents: course.documents,
      tasks: course.tasks
    };
  }

  async update(id: string, updateCourseDto: any): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndUpdate(
      id, 
      updateCourseDto,
      { new: true }
    ).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
    
    return course;
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
      url: `/uploads/courseDocuments/${file.filename}`
    };
    
    if (!course.documents) {
      course.documents = [];
    }
    
    course.documents.push(document);
    await course.save();
    
    return { message: 'Dokument erfolgreich zum Kurs hinzugefügt', document };
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Kurs mit ID ${id} nicht gefunden`);
    }
  }

  async enrollStudent(courseName: string, username: string): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    if (course.participants && course.participants.includes(username)) {
      return { message: 'Benutzer ist bereits für diesen Kurs eingeschrieben' };
    }
    
    course.participants.push(username);
    await course.save();
    
    return { message: 'Benutzer erfolgreich eingeschrieben' };
  }

  async addTaskToCourse(courseName: string, task: any): Promise<any> {
    const course = await this.courseModel.findOne({ title: courseName }).exec();
    
    if (!course) {
      throw new NotFoundException(`Kurs mit dem Namen "${courseName}" nicht gefunden`);
    }
    
    if (!course.tasks) {
      course.tasks = [];
    }
    
    course.tasks.push({
      taskId: task._id.toString(),
      name: task.taskName,
      description: task.taskDescription,
      documents: task.documents || []
    });
    
    await course.save();
    
    return { message: 'Aufgabe erfolgreich zum Kurs hinzugefügt' };
  }

  async updateCourseParticipants(data: {courseName: string, participants: any[]}) {
    const course = await this.findCourseByName(data.courseName);
    if (!course) {
      throw new NotFoundException(`Kurs "${data.courseName}" nicht gefunden`);
    }
    
    course.participants = data.participants;
    return await course.save();
  }

  async findCourseByName(name: string): Promise<CourseDocument> {
    const course = await this.courseModel.findOne({ title: name }).exec();
    if (!course) {
      throw new NotFoundException(`Kurs mit Namen "${name}" nicht gefunden`);
    }
    return course;
  }
  
}