import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { GridFSService } from '../files/gridfs.service';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Task, TaskDocument } from './schemas/task.schema';
import { TasksService } from './tasks.service';

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
  let gridFsService: GridFSService;

  // Mock GridFS Service
  const mockGridFSService = {
    storeFile: jest.fn().mockResolvedValue({ id: 'fileId123' }),
    getFile: jest.fn().mockResolvedValue({ filename: 'test.pdf' }),
    deleteFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    // More complete mongoose model mocks with exec function already included
    const mockTaskModel = {
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      deleteOne: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn().mockReturnThis(),
      new: jest.fn(),
      constructor: jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: 'taskId',
          courseName: 'Test Course',
          taskName: 'Test Task',
          documents: [],
          submissions: []
        })
      })),
      prototype: {
        save: jest.fn(),
      },
    };

    const mockCourseModel = {
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      deleteOne: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn().mockReturnThis(),
    };

    const mockSubmissionModel = {
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

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
        {
          provide: GridFSService,
          useValue: mockGridFSService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<Model<TaskDocument>>(getModelToken(Task.name));
    submissionModel = module.get<Model<SubmissionDocument>>(getModelToken(Submission.name));
    courseModel = module.get<Model<CourseDocument>>(getModelToken(Course.name));
    gridFsService = module.get<GridFSService>(GridFSService);

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
        id: 'fileId123',
      };

      const mockTask = {
        courseName,
        taskName,
        taskDescription,
        documents: [
          {
            name: file.originalname,
            fileId: file.id,
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
              fileId: file.id,
            },
          ],
        }),
      };

      // Mock the findOne method to return null (task doesn't exist)
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);
      
      // Create a constructor function for the model
      const ModelConstructor = function() {
        return mockTask;
      };
      
      // Replace the service's taskModel with our mock constructor
      const originalTaskModel = service['taskModel'];
      service['taskModel'] = ModelConstructor as any;

      const result = await service.createTask(courseName, taskName, taskDescription, file);
      
      // Restore the original taskModel
      service['taskModel'] = originalTaskModel;

      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        _id: 'taskId',
        courseName,
        taskName,
        taskDescription,
        documents: [
          {
            name: file.originalname,
            fileId: file.id,
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

      // Mock the findOne method to return null (task doesn't exist)
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);
      
      // Create a constructor function for the model
      const ModelConstructor = function() {
        return mockTask;
      };
      
      // Replace the service's taskModel with our mock constructor
      const originalTaskModel = service['taskModel'];
      service['taskModel'] = ModelConstructor as any;

      const result = await service.createTask(courseName, taskName, taskDescription, null);
      
      // Restore the original taskModel
      service['taskModel'] = originalTaskModel;

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

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue({ taskName: 'Existing Task' });

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
        documents: [{ name: 'doc1', fileId: 'doc-file-id' }],
        submissions: [
          {
            userName: username,
            file: { name: 'submission.pdf', fileId: 'submission-file-id' },
            feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
            comment: '',
          },
        ],
      };

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.getTaskDetailsForStudent(courseName, taskName, username);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(result).toEqual({
        taskId: 'taskId',
        taskName: 'Test Task',
        description: 'Task description',
        documents: [{ name: 'doc1', url: '/api/gridfs/file/doc-file-id' }],
        submission: {
          userName: username,
          file: { name: 'submission.pdf', url: '/api/gridfs/file/submission-file-id' },
          feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
          comment: '',
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
        documents: [{ name: 'doc1', fileId: 'doc-file-id' }],
        submissions: [
          {
            userName: 'anotherStudent',
            file: { name: 'submission.pdf', fileId: 'other-file-id' },
          },
        ],
      };

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.getTaskDetailsForStudent(courseName, taskName, username);

      expect(result.submission).toBeNull();
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

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
        id: 'fileId123',
      };
      const comment = 'My submission comment';

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
                fileId: file.id,
              },
              comment,
            },
          ],
        }),
      };

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.createSubmission(courseName, taskName, username, file, comment);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Abgabe erfolgreich gespeichert',
        submission: {
          userName: username,
          file: {
            name: file.originalname,
            url: `/api/gridfs/file/${file.id}`,
          },
          comment,
        },
      });
    });

    it('should update an existing submission', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const username = 'student1';
      const file = {
        originalname: 'new_submission.pdf',
        id: 'fileId123',
      };

      // Create mock task with an existing submission for this user
      const mockTask = {
        _id: 'taskId',
        courseName,
        taskName,
        submissions: [
          {
            userName: username,
            file: {
              name: 'old_submission.pdf',
              fileId: 'old-file-id',
            },
          }
        ],
        save: jest.fn().mockResolvedValue({
          submissions: [
            {
              userName: username,
              file: {
                name: file.originalname,
                fileId: file.id,
              },
            },
          ],
        }),
      };
      
      mockTask.submissions.findIndex = jest.fn(() => 0);
      mockTask.submissions.push = jest.fn();
      mockTask.submissions.splice = jest.fn((index, count, newItem) => {
        mockTask.submissions[index] = newItem;
        return [{ userName: username }];
      });

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.createSubmission(courseName, taskName, username, file);

      expect(gridFsService.deleteFile).toHaveBeenCalledWith('old-file-id');
      expect(mockTask.save).toHaveBeenCalled();
      expect(result.message).toBe('Abgabe erfolgreich gespeichert');
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

      await expect(service.createSubmission('Course', 'Task', 'student', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSubmissionsForTask', () => {
    it('should return all submissions for a task', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      
      const mockTask = {
        taskName,
        taskDescription: 'Task description',
        submissions: [
          {
            userName: 'student1',
            file: { name: 'submission1.pdf', fileId: 'file-id-1' },
            feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
            comment: 'My comment',
          },
          {
            userName: 'student2',
            file: { name: 'submission2.pdf', fileId: 'file-id-2' },
          },
        ],
      };

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.getSubmissionsForTask(courseName, taskName);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(result).toEqual({
        taskName: 'Test Task',
        taskDescription: 'Task description',
        submissions: [
          {
            userName: 'student1',
            file: { name: 'submission1.pdf', url: '/api/gridfs/file/file-id-1' },
            feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
            comment: 'My comment',
          },
          {
            userName: 'student2',
            file: { name: 'submission2.pdf', url: '/api/gridfs/file/file-id-2' },
          },
        ],
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

      await expect(service.getSubmissionsForTask('Course', 'Task')).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveFeedback', () => {
    it('should save feedback for a submission', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const submissionName = 'submission.pdf';
      const studentName = 'student1';
      const feedbackText = 'Good job';
      const feedbackBy = 'teacher1';

      const mockTask = {
        submissions: [
          {
            userName: studentName,
            file: { name: submissionName },
            feedback: null,
          },
        ],
        save: jest.fn().mockResolvedValue({
          submissions: [
            {
              userName: studentName,
              file: { name: submissionName },
              feedback: { text: feedbackText, feedbackFrom: feedbackBy },
            },
          ],
        }),
      };

      mockTask.submissions.findIndex = jest.fn(() => 0);

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.saveFeedback(
        courseName,
        taskName,
        submissionName,
        studentName,
        feedbackText,
        feedbackBy
      );

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Feedback erfolgreich gespeichert',
        feedback: { text: feedbackText, feedbackFrom: feedbackBy },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

      await expect(
        service.saveFeedback('Course', 'Task', 'submission.pdf', 'student1', 'feedback', 'teacher')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if submission not found', async () => {
      const mockTask = {
        submissions: [
          {
            userName: 'differentStudent',
            file: { name: 'other.pdf' },
          },
        ],
      };

      mockTask.submissions.findIndex = jest.fn(() => -1);

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      await expect(
        service.saveFeedback('Course', 'Task', 'submission.pdf', 'student1', 'feedback', 'teacher')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskData = {
        courseName: 'Test Course',
        name: 'Test Task',
        description: 'Updated description',
      };

      const mockTask = {
        taskDescription: 'Original description',
        save: jest.fn().mockResolvedValue({
          taskDescription: 'Updated description',
        }),
      };

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.updateTask(taskData);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName: taskData.courseName,
        taskName: taskData.name,
      });
      expect(mockTask.taskDescription).toBe('Updated description');
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Aufgabe erfolgreich aktualisiert' });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

      await expect(
        service.updateTask({
          courseName: 'Course',
          name: 'Task',
          description: 'Description',
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and its references', async () => {
      const courseName = 'Test Course';
      const taskId = 'taskId';

      const mockTask = {
        _id: taskId,
        taskName: 'Test Task',
        documents: [{ name: 'doc1.pdf', fileId: 'doc-file-id' }],
        submissions: [{ file: { name: 'submission.pdf', fileId: 'submission-file-id' } }],
      };

      const mockCourse = {
        title: courseName,
        tasks: [{ taskId }],
        save: jest.fn().mockResolvedValue({}),
      };
      
      mockCourse.tasks.findIndex = jest.fn(() => 0);
      mockCourse.tasks.splice = jest.fn();

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);
      
      jest.spyOn(courseModel, 'findOne').mockReturnThis();
      jest.spyOn(courseModel, 'exec').mockResolvedValue(mockCourse);
      
      jest.spyOn(taskModel, 'deleteOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteTask(courseName, taskId);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        _id: taskId,
      });
      expect(courseModel.findOne).toHaveBeenCalledWith({ 
        title: courseName 
      });
      expect(gridFsService.deleteFile).toHaveBeenCalledWith('doc-file-id');
      expect(gridFsService.deleteFile).toHaveBeenCalledWith('submission-file-id');
      expect(mockCourse.save).toHaveBeenCalled();
      expect(taskModel.deleteOne).toHaveBeenCalledWith({ _id: taskId });
      expect(result).toEqual({
        message: 'Aufgabe erfolgreich gelöscht',
        deletedCount: 1,
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

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

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);
      
      jest.spyOn(courseModel, 'findOne').mockReturnThis();
      jest.spyOn(courseModel, 'exec').mockResolvedValue(mockCourse);
      
      jest.spyOn(taskModel, 'deleteOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteTask('Course', 'taskId')).rejects.toThrow('Aufgabe konnte nicht gelöscht werden');
    });
  });

  describe('addDocumentToTask', () => {
    it('should add a document to a task', async () => {
      const courseName = 'Test Course';
      const taskId = 'taskId';
      const file = {
        originalname: 'document.pdf',
        id: 'fileId123',
      };

      const mockTask = {
        _id: taskId,
        documents: [],
        save: jest.fn().mockResolvedValue({
          documents: [
            {
              name: file.originalname,
              fileId: file.id,
            },
          ],
        }),
      };

      mockTask.documents.push = jest.fn();

      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(mockTask);

      const result = await service.addDocumentToTask(courseName, taskId, file);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        _id: taskId,
      });
      expect(mockTask.documents.push).toHaveBeenCalledWith({
        name: file.originalname,
        fileId: file.id,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Dokument erfolgreich zur Aufgabe hinzugefügt',
        document: {
          name: file.originalname,
          url: `/api/gridfs/file/${file.id}`,
        },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnThis();
      jest.spyOn(taskModel, 'exec').mockResolvedValue(null);

      await expect(service.addDocumentToTask('Course', 'taskId', {})).rejects.toThrow(NotFoundException);
    });
  });
});