import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GridFSService } from '../files/gridfs.service';
import { CoursesService } from './courses.service';
import { Course, CourseDocument } from './schemas/course.schema';

jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
  },
  existsSync: jest.fn().mockReturnValue(true),
}));

describe('CoursesService', () => {
  let service: CoursesService;
  let model: Model<CourseDocument>;

  // Mock GridFS Service
  const mockGridFSService = {
    storeFile: jest.fn().mockResolvedValue({ id: 'fileId123' }),
    getFile: jest.fn().mockResolvedValue({ filename: 'test.pdf' }),
    deleteFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    // Einfachen aber korrekten Mock für das CourseModel erstellen
    const mockCourseModelType = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn()
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      deleteOne: jest.fn().mockReturnValue({
        exec: jest.fn()
      })
    } as unknown as Model<CourseDocument>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModelType,
        },
        {
          provide: GridFSService,
          useValue: mockGridFSService,
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
      const mockCourse = {
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

      // Mock the findOne method to return null (course doesn't exist)
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);
      
      // Create a constructor function for the model
      const ModelConstructor = function() {
        return mockCourse;
      };
      
      // Replace the service's courseModel with our mock constructor
      const originalCourseModel = service['courseModel'];
      service['courseModel'] = ModelConstructor as any;

      const result = await service.create(createCourseDto);
      
      // Restore the original model
      service['courseModel'] = originalCourseModel;

      expect(mockCourse.save).toHaveBeenCalled();
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
      
      // Mock findOne to return an existing course
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ title: 'Existing Course' })
      } as any);

      await expect(service.create(createCourseDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const courses = [{ title: 'Course 1' }, { title: 'Course 2' }];
      // Direkt den exec-Mock verwenden, statt model.find zu mocken
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(courses)
      } as any);

      const result = await service.findAll();

      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const course = { title: 'Course 1' };
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(course)
      } as any);

      const result = await service.findOne('courseId');

      expect(model.findById).toHaveBeenCalledWith('courseId');
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.findOne('nonExistingId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCourseDetails', () => {
    it('should return course details by name', async () => {
      const course = {
        _id: 'courseId',
        title: 'Test Course',
        textContent: 'Content',
        participants: ['user1', 'user2'],
        documents: [{ name: 'doc1', fileId: 'doc-file-id' }],
        tasks: [{ taskId: '1', name: 'Task 1', description: 'Task description', documents: [] }],
      };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(course),
      } as any);

      const result = await service.findCourseDetails('Test Course');

      expect(model.findOne).toHaveBeenCalledWith({ title: 'Test Course' });
      expect(result).toEqual({
        title: 'Test Course',
        textContent: 'Content',
        participants: ['user1', 'user2'],
        documents: [{ name: 'doc1', url: '/api/gridfs/file/doc-file-id' }],
        tasks: [{ taskId: '1', name: 'Task 1', description: 'Task description', documents: [] }],
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findCourseDetails('Non Existing Course')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a course successfully', async () => {
      const updateCourseDto = { title: 'Updated Course' };
      const updatedCourse = { id: 'courseId', ...updateCourseDto };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCourse),
      } as any);

      const result = await service.update('courseId', updateCourseDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('courseId', updateCourseDto, { new: true });
      expect(result).toEqual(updatedCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update('nonExistingId', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a course successfully', async () => {
      const mockCourse = {
        _id: 'courseId',
        documents: [],
      };
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      } as any);
      jest.spyOn(model, 'deleteOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      } as any);

      await service.remove('courseId');

      expect(model.findById).toHaveBeenCalledWith('courseId');
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'courseId' });
    });

    it('should throw NotFoundException if course not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

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

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(course),
      } as any);

      const result = await service.addTaskToCourse(courseName, task);

      expect(model.findOne).toHaveBeenCalledWith({ title: courseName });
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
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.addTaskToCourse('Non Existing Course', { _id: 'taskId' })).rejects.toThrow(NotFoundException);
    });
  });
});