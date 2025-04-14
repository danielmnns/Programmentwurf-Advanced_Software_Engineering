import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task, TaskDocument } from './schemas/task.schema';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/to/file'),
}));

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: Model<TaskDocument>;
  let submissionModel: Model<SubmissionDocument>;
  let courseModel: Model<CourseDocument>;

  const mockTaskModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    new: jest.fn(),
    constructor: jest.fn(),
  };

  const mockSubmissionModel = {
    findOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    new: jest.fn(),
    constructor: jest.fn(),
  };

  const mockCourseModel = {
    findOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
        {
          provide: getModelToken(Submission.name),
          useValue: mockSubmissionModel,
        },
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<Model<TaskDocument>>(getModelToken(Task.name));
    submissionModel = module.get<Model<SubmissionDocument>>(getModelToken(Submission.name));
    courseModel = module.get<Model<CourseDocument>>(getModelToken(Course.name));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const taskDescription = 'Task description';
      const file = {
        originalname: 'test.pdf',
        filename: '1234567890.pdf',
      };

      const mockTask = {
        courseName,
        taskName,
        taskDescription,
        documents: [
          {
            name: file.originalname,
            url: `/uploads/tasks/${file.filename}`,
          },
        ],
        submissions: [],
        save: jest.fn().mockResolvedValue({
          _id: 'taskId',
          courseName,
          taskName,
          taskDescription,
          documents: [
            {
              name: file.originalname,
              url: `/uploads/tasks/${file.filename}`,
            },
          ],
        }),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockTaskModel.constructor.mockImplementation(() => mockTask);

      const result = await service.createTask(courseName, taskName, taskDescription, file);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        _id: 'taskId',
        courseName,
        taskName,
        taskDescription,
        documents: [
          {
            name: file.originalname,
            url: `/uploads/tasks/${file.filename}`,
          },
        ],
      });
    });

    it('should create a task without a file', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const taskDescription = 'Task description';

      const mockTask = {
        courseName,
        taskName,
        taskDescription,
        documents: [],
        submissions: [],
        save: jest.fn().mockResolvedValue({
          _id: 'taskId',
          courseName,
          taskName,
          taskDescription,
          documents: [],
        }),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockTaskModel.constructor.mockImplementation(() => mockTask);

      const result = await service.createTask(courseName, taskName, taskDescription, null);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        _id: 'taskId',
        courseName,
        taskName,
        taskDescription,
        documents: [],
      });
    });

    it('should throw BadRequestException if task already exists', async () => {
      const courseName = 'Test Course';
      const taskName = 'Existing Task';
      const taskDescription = 'Task description';

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ taskName: 'Existing Task' }),
      });

      await expect(service.createTask(courseName, taskName, taskDescription, null)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTaskDetailsForStudent', () => {
    it('should return task details for a student', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';
      
      const mockTask = {
        _id: 'taskId',
        taskName,
        taskDescription: 'Task description',
        documents: [{ name: 'doc1', url: '/path/to/file' }],
        submissions: [
          {
            userName: username,
            file: { name: 'submission.pdf', url: '/path/to/submission' },
            feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
          },
        ],
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.getTaskDetailsForStudent(courseName, taskName, username);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(result).toEqual({
        taskId: 'taskId',
        taskName: 'Test Task',
        description: 'Task description',
        documents: [{ name: 'doc1', url: '/path/to/file' }],
        submission: {
          userName: username,
          file: { name: 'submission.pdf', url: '/path/to/submission' },
          feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
        },
      });
    });

    it('should return task details without submission if student has not submitted', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';
      
      const mockTask = {
        _id: 'taskId',
        taskName,
        taskDescription: 'Task description',
        documents: [{ name: 'doc1', url: '/path/to/file' }],
        submissions: [
          {
            userName: 'anotherStudent',
            file: { name: 'submission.pdf', url: '/path/to/submission' },
          },
        ],
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.getTaskDetailsForStudent(courseName, taskName, username);

      expect(result.submission).toBeNull();
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getTaskDetailsForStudent('Course', 'Task', 'student')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSubmission', () => {
    it('should create a new submission for a task', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';
      const file = {
        originalname: 'submission.pdf',
        filename: '1234567890.pdf',
      };

      const mockTask = {
        _id: 'taskId',
        taskName,
        submissions: [],
        save: jest.fn().mockResolvedValue({
          submissions: [
            {
              userName: username,
              file: {
                name: file.originalname,
                url: `/uploads/submissions/${file.filename}`,
              },
            },
          ],
        }),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.createSubmission(courseName, taskName, username, file);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.submissions.push).toHaveBeenCalled;
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Abgabe erfolgreich gespeichert',
        submission: {
          userName: username,
          file: {
            name: file.originalname,
            url: `/uploads/submissions/${file.filename}`,
          },
        },
      });
    });

    it('should update an existing submission', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';
      const file = {
        originalname: 'new_submission.pdf',
        filename: '1234567890.pdf',
      };

      const oldSubmission = {
        userName: username,
        file: {
          name: 'old_submission.pdf',
          url: '/uploads/submissions/old.pdf',
        },
      };

      const mockTask = {
        submissions: [oldSubmission],
        save: jest.fn().mockResolvedValue({
          submissions: [
            {
              userName: username,
              file: {
                name: file.originalname,
                url: `/uploads/submissions/${file.filename}`,
              },
            },
          ],
        }),
      };

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      await service.createSubmission(courseName, taskName, username, file);

      expect(path.join).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createSubmission('Course', 'Task', 'student', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSubmissionForUser', () => {
    it('should delete a submission for a user', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';

      const mockTask = {
        submissions: [
          {
            userName: username,
            file: {
              name: 'submission.pdf',
              url: '/uploads/submissions/file.pdf',
            },
          },
        ],
        save: jest.fn().mockResolvedValue({}),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.deleteSubmissionForUser(courseName, taskName, username);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.submissions.length).toBe(0);
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Abgabe erfolgreich gelöscht' });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteSubmissionForUser('Course', 'Task', 'student')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if submission not found', async () => {
      const mockTask = {
        submissions: [
          {
            userName: 'anotherStudent',
            file: {
              name: 'submission.pdf',
              url: '/uploads/submissions/file.pdf',
            },
          },
        ],
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      await expect(service.deleteSubmissionForUser('Course', 'Task', 'student')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and its references', async () => {
      const courseName = 'Test Course';
      const taskId = 'taskId';

      const mockTask = {
        _id: taskId,
        taskName: 'Test Task',
        documents: [{ url: '/uploads/taskDocuments/doc.pdf' }],
        submissions: [{ file: { url: '/uploads/submissions/submission.pdf' } }],
      };

      const mockCourse = {
        title: courseName,
        tasks: [{ taskId }],
        save: jest.fn().mockResolvedValue({}),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      const result = await service.deleteTask(courseName, taskId);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        courseName,
        _id: taskId,
      });
      expect(mockCourseModel.findOne).toHaveBeenCalledWith({ 
        title: courseName 
      });
      expect(mockCourse.save).toHaveBeenCalled();
      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({ _id: taskId });
      expect(result).toEqual({
        message: 'Aufgabe erfolgreich gelöscht',
        deletedCount: 1,
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteTask('Course', 'taskId')).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if delete operation fails', async () => {
      const mockTask = {
        _id: 'taskId',
        documents: [],
        submissions: [],
      };

      const mockCourse = {
        title: 'Test Course',
        tasks: [],
        save: jest.fn().mockResolvedValue({}),
      };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.deleteTask('Course', 'taskId')).rejects.toThrow('Aufgabe konnte nicht gelöscht werden');
    });
  });
});