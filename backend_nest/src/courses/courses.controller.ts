import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Kursleiter', 'Dozent')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Kursleiter', 'Dozent')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Kursleiter')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
  
  @Post(':id/enroll/:userId')
  enrollStudent(@Param('id') courseId: string, @Param('userId') userId: string) {
    return this.coursesService.enrollStudent(courseId, userId);
  }

  @Post(':id/unenroll/:userId')
  unenrollStudent(@Param('id') courseId: string, @Param('userId') userId: string) {
    return this.coursesService.unenrollStudent(courseId, userId);
  }
}