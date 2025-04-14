import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseDocument } from './schemas/course.schema';
import * as fs from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
  },
  existsSync: jest.fn().mockReturnValue(true),
}));

const mockCourseModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  new: jest.fn().mockResolvedValue({}),
  constructor: jest.fn().mockResolvedValue({}),
  save: jest.fn(),
  exec: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;
  let model: Model<CourseDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    model = module.get<Model<CourseDocument>>(getModelToken(Course.name));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto = { title: 'Test Course' };
      const course = {
        title: 'Test Course',
        textContent: '',
        participants: [],
        documents: [],
        tasks: [],
        save: jest.fn().mockResolvedValue({
          title: 'Test Course',
          textContent: '',
          participants: [],
          documents: [],
          tasks: [],
        }),
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockCourseModel.constructor.mockImplementation(() => course);

      const result = await service.create(createCourseDto);

      expect(mockCourseModel.findOne).toHaveBeenCalledWith({ title: 'Test Course' });
      expect(course.save).toHaveBeenCalled();
      expect(result).toEqual({
        title: 'Test Course',
        textContent: '',
        participants: [],
        documents: [],
        tasks: [],
      });
    });

    it('should throw BadRequestException if course with title already exists', async () => {
      const createCourseDto = { title: 'Existing Course' };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ title: 'Existing Course' }),
      });

      await expect(service.create(createCourseDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const courses = [{ title: 'Course 1' }, { title: 'Course 2' }];
      mockCourseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(courses),
      });

      const result = await service.findAll();

      expect(mockCourseModel.find).toHaveBeenCalled();
      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const course = { title: 'Course 1' };
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(course),
      });

      const result = await service.findOne('courseId');

      expect(mockCourseModel.findById).toHaveBeenCalledWith('courseId');
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonExistingId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCourseDetails', () => {
    it('should return course details by name', async () => {
      const course = {
        title: 'Test Course',
        textContent: 'Content',
        participants: ['user1', 'user2'],
        documents: [{ name: 'doc1', url: '/path/to/doc' }],
        tasks: [{ taskId: '1', name: 'Task 1' }],
      };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(course),
      });

      const result = await service.findCourseDetails('Test Course');

      expect(mockCourseModel.findOne).toHaveBeenCalledWith({ title: 'Test Course' });
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findCourseDetails('Non Existing Course')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a course successfully', async () => {
      const updateCourseDto = { title: 'Updated Course' };
      const updatedCourse = { id: 'courseId', ...updateCourseDto };

      mockCourseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCourse),
      });

      const result = await service.update('courseId', updateCourseDto);

      expect(mockCourseModel.findByIdAndUpdate).toHaveBeenCalledWith('courseId', updateCourseDto, { new: true });
      expect(result).toEqual(updatedCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonExistingId', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a course successfully', async () => {
      mockCourseModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('courseId');

      expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: 'courseId' });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.remove('nonExistingId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addTaskToCourse', () => {
    it('should add a task to a course', async () => {
      const courseName = 'Test Course';
      const task = {
        _id: 'taskId',
        taskName: 'Test Task',
        taskDescription: 'Task description',
        documents: [{ name: 'doc1', url: '/path/to/doc' }],
      };
      const course = {
        title: courseName,
        tasks: [],
        save: jest.fn().mockResolvedValue({
          title: courseName,
          tasks: [{ taskId: 'taskId', name: 'Test Task', description: 'Task description', documents: [{ name: 'doc1', url: '/path/to/doc' }] }],
        }),
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(course),
      });

      const result = await service.addTaskToCourse(courseName, task);

      expect(mockCourseModel.findOne).toHaveBeenCalledWith({ title: courseName });
      expect(course.save).toHaveBeenCalled();
      expect(result.tasks[0]).toEqual(
        expect.objectContaining({
          taskId: 'taskId',
          name: 'Test Task',
          description: 'Task description',
        })
      );
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addTaskToCourse('Non Existing Course', { _id: 'taskId' })).rejects.toThrow(NotFoundException);
    });
  });
});