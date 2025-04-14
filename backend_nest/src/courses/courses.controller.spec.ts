import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findCourseDetails: jest.fn(),
    updateCourseText: jest.fn(),
    addDocumentToCourse: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeDocumentFromCourse: jest.fn(),
    updateCourseParticipants: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCourses', () => {
    it('should return an array of courses', async () => {
      const result = [{ title: 'Course 1' }, { title: 'Course 2' }];
      mockCoursesService.findAll.mockResolvedValue(result);

      expect(await controller.getAllCourses()).toBe(result);
      expect(mockCoursesService.findAll).toHaveBeenCalled();
    });
  });

  describe('createCourse', () => {
    it('should create a course', async () => {
      const courseData = { title: 'New Course' };
      const result = { id: 'courseId', ...courseData };
      mockCoursesService.create.mockResolvedValue(result);

      expect(await controller.createCourse(courseData)).toBe(result);
      expect(mockCoursesService.create).toHaveBeenCalledWith(courseData);
    });
  });

  describe('getCourseDetails', () => {
    it('should return course details', async () => {
      const courseName = 'Test Course';
      const result = {
        title: courseName,
        textContent: 'Content',
        participants: ['user1', 'user2'],
        documents: [],
        tasks: [],
      };
      mockCoursesService.findCourseDetails.mockResolvedValue(result);

      expect(await controller.getCourseDetails(courseName)).toBe(result);
      expect(mockCoursesService.findCourseDetails).toHaveBeenCalledWith(courseName);
    });
  });

  describe('updateCourseText', () => {
    it('should update course text', async () => {
      const payload = { courseName: 'Test Course', textContent: 'New content' };
      const result = { message: 'Kurstext erfolgreich aktualisiert' };
      mockCoursesService.updateCourseText.mockResolvedValue(result);

      expect(await controller.updateCourseText(payload)).toBe(result);
      expect(mockCoursesService.updateCourseText).toHaveBeenCalledWith(
        payload.courseName,
        payload.textContent
      );
    });
  });

  describe('addCourseDocument', () => {
    it('should add document to course', async () => {
      const file = { originalname: 'test.pdf' };
      const body = { courseName: 'Test Course' };
      const result = { 
        message: 'Dokument erfolgreich zum Kurs hinzugefügt',
        document: { name: 'test.pdf', url: '/uploads/courseDocuments/123.pdf' }
      };
      mockCoursesService.addDocumentToCourse.mockResolvedValue(result);

      expect(await controller.addCourseDocument(file, body)).toBe(result);
      expect(mockCoursesService.addDocumentToCourse).toHaveBeenCalledWith(
        body.courseName,
        file
      );
    });
  });

  describe('updateCourse', () => {
    it('should update a course', async () => {
      const id = 'courseId';
      const updateData = { title: 'Updated Course' };
      const result = { id, ...updateData };
      mockCoursesService.update.mockResolvedValue(result);

      expect(await controller.updateCourse(id, updateData)).toBe(result);
      expect(mockCoursesService.update).toHaveBeenCalledWith(id, updateData);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      const id = 'courseId';
      mockCoursesService.remove.mockResolvedValue(undefined);

      await controller.deleteCourse(id);
      expect(mockCoursesService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('removeDocumentFromCourse', () => {
    it('should remove document from course', async () => {
      const payload = { courseName: 'Test Course', documentName: 'doc.pdf' };
      const result = { message: 'Dokument erfolgreich aus dem Kurs entfernt' };
      mockCoursesService.removeDocumentFromCourse.mockResolvedValue(result);

      expect(await controller.removeDocumentFromCourse(payload)).toBe(result);
      expect(mockCoursesService.removeDocumentFromCourse).toHaveBeenCalledWith(
        payload.courseName,
        payload.documentName
      );
    });
  });

  describe('manageUsers', () => {
    it('should update course participants', async () => {
      const userData = { courseName: 'Test Course', participants: ['user1', 'user2'] };
      const result = { title: 'Test Course', participants: ['user1', 'user2'] };
      mockCoursesService.updateCourseParticipants.mockResolvedValue(result);

      expect(await controller.manageUsers(userData)).toBe(result);
      expect(mockCoursesService.updateCourseParticipants).toHaveBeenCalledWith(userData);
    });
  });
});