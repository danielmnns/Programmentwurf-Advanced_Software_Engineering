import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Alle Kurse abrufen (rollenbasiert)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllCourses() {
    return this.coursesService.findAll();
  }

  // Kurs erstellen
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async createCourse(@Body() courseData: any) {
    return this.coursesService.create(courseData);
  }

  // Kursdetails für Benutzeransicht
  @Get('user-kurs')
  @UseGuards(JwtAuthGuard)
  async getCourseDetails(@Query('courseName') courseName: string) {
    return this.coursesService.findCourseDetails(courseName);
  }

  // Kurstext aktualisieren
  @Post('admin/updateText')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  async updateCourseText(@Body() payload: { courseName: string; textContent: string }) {
    return this.coursesService.updateCourseText(payload.courseName, payload.textContent);
  }

  // Dokument zu einem Kurs hinzufügen
  @Post('admin/addDocument')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dozent', 'studiengangsleiter')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/courseDocuments',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  async addCourseDocument(@UploadedFile() file, @Body() body: { courseName: string }) {
    return this.coursesService.addDocumentToCourse(body.courseName, file);
  }

  // Kurs aktualisieren (z.B. für Teilnehmer)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async updateCourse(@Param('id') id: string, @Body() updateData: any) {
    return this.coursesService.update(id, updateData);
  }

  // Kurs löschen
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
  

  @Get('user-verwaltung')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async getCoursesForUserManagement() {
    const courses = await this.coursesService.findAll();
    return courses.map((course, index) => ({
      id: index + 1,
      courseName: course.title,
      participants: course.participants || []
    }));
  }

  // Zusätzlich für courseName-basierte Suche
  @Get('user-kurs')
  @UseGuards(JwtAuthGuard)
  async getCourseByName(@Query('courseName') courseName: string) {
    return this.coursesService.findCourseByName(courseName);
  }

    @Get('test')
  async testEndpoint() {
    return { message: 'Test endpoint working!' };
  }
}
