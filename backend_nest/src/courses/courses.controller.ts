import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllCourses(@Req() req: Request) {
    return this.coursesService.getAllCourses(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dozent', 'admin', 'studiengangsleiter')
  @Post()
  createCourse(@Body() createCourseDto: any) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dozent', 'admin', 'studiengangsleiter')
  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() updateCourseDto: any) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dozent', 'admin', 'studiengangsleiter')
  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  enrollUser(@Param('id') id: string, @Req() req: Request) {
    return this.coursesService.enrollUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unenroll')
  unenrollUser(@Param('id') id: string, @Req() req: Request) {
    return this.coursesService.unenrollUser(id, req.user);
  }
}