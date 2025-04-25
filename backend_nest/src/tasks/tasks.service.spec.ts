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

  // Mock GridFS Service
  const mockGridFSService = {
    storeFile: jest.fn().mockResolvedValue({ id: 'fileId123' }),
    getFile: jest.fn().mockResolvedValue({ filename: 'test.pdf' }),
    deleteFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    // Typkorrekte Mocks für Model-Methoden
    const mockTaskModelType = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      deleteOne: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
    } as unknown as Model<TaskDocument>;

    const mockCourseModelType = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
    } as unknown as Model<CourseDocument>;

    const mockSubmissionModelType = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn()
      }),
    } as unknown as Model<SubmissionDocument>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModelType,
        },
        {
          provide: getModelToken(Submission.name),
          useValue: mockSubmissionModelType,
        },
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
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);
      
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
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);
      
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

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ taskName: 'Existing Task' })
      } as any);

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

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

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
        documents: [{ name: 'doc1', url: '/path/to/file' }],
        submissions: [
          {
            userName: 'anotherStudent',
            file: { name: 'submission.pdf', url: '/path/to/submission' },
          },
        ],
      };

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask)
      } as any);

      const result = await service.getTaskDetailsForStudent(courseName, taskName, username);

      expect(result.submission).toBeNull();
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

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
            },
          ],
        }),
      };

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      const result = await service.createSubmission(courseName, taskName, username, file);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Abgabe erfolgreich gespeichert',
        submission: {
          userName: username,
          comment: '',
          file: {
            name: file.originalname,
            url: `/api/gridfs/file/${file.id}`,
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
        id: 'fileId123',
      };

      // Clear any previous calls to the mock
      mockGridFSService.deleteFile.mockClear();

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
      
      // Implementiere findIndex korrekt, damit es den richtigen Index zurückgibt
      mockTask.submissions.findIndex = jest.fn(criteria => {
        const index = mockTask.submissions.findIndex(
          submission => submission.userName === username
        );
        return index;
      });
      
      // Der Service nutzt die Datei-ID für GridFSService.deleteFile
      // Wir müssen sicherstellen, dass der Zugriff auf diese ID richtig simuliert wird
      mockGridFSService.deleteFile.mockImplementation((fileId) => {
        expect(fileId).toBe('old-file-id');
        return Promise.resolve(true);
      });
      
      // In our test implementation, simulate the splice method
      mockTask.submissions.splice = jest.fn().mockImplementation((index, count, ...items) => {
        if (items.length > 0) {
          mockTask.submissions[index] = items[0];
        }
        return [mockTask.submissions[index]];
      });
      
      // Set up the mock task with existing submission
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      const result = await service.createSubmission(courseName, taskName, username, file);

      // Verify file deletion and save calls
      expect(mockGridFSService.deleteFile).toHaveBeenCalledWith('old-file-id');
      expect(mockTask.save).toHaveBeenCalled();
      expect(result.message).toBe('Abgabe erfolgreich gespeichert');
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

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

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      const result = await service.deleteSubmissionForUser(courseName, taskName, username);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        taskName,
      });
      expect(mockTask.submissions.length).toBe(0);
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Abgabe erfolgreich gelöscht' });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      await expect(service.deleteSubmissionForUser('Course', 'Task', 'student')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if submission not found', async () => {
      const courseName = 'Course';
      const taskName = 'Task';
      const username = 'student';

      // Mock a task with no matching submission
      const mockTask = {
        submissions: [
          {
            userName: 'anotherStudent',
            file: {
              name: 'submission.pdf',
              fileId: 'file-id',
            },
          },
        ],
      };

      // Mock task.submissions.findIndex to return -1 (not found)
      mockTask.submissions.findIndex = jest.fn(() => -1);
      
      // Mock task.submissions.splice um sicherzustellen, dass es nicht aufgerufen wird
      mockTask.submissions.splice = jest.fn();
      
      // Mock the task model's findOne method
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      // Verwende eine in-line Implementierung statt des ursprünglichen Dienstes
      try {
        await service.deleteSubmissionForUser(courseName, taskName, username);
        // Der Test sollte diese Zeile nie erreichen
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(`Keine Abgabe für Benutzer ${username} gefunden`);
      }
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

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

      jest.spyOn(courseModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      } as any);

      jest.spyOn(taskModel, 'deleteOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      } as any);

      const result = await service.deleteTask(courseName, taskId);

      expect(taskModel.findOne).toHaveBeenCalledWith({
        courseName,
        _id: taskId,
      });
      expect(courseModel.findOne).toHaveBeenCalledWith({ 
        title: courseName 
      });
      expect(mockCourse.save).toHaveBeenCalled();
      expect(taskModel.deleteOne).toHaveBeenCalledWith({ _id: taskId });
      expect(result).toEqual({
        message: 'Aufgabe erfolgreich gelöscht',
        deletedCount: 1,
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        // Hinzufügen der wichtigsten Query-Methoden um Typenkompatibilität zu erreichen
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      } as any);

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

      jest.spyOn(taskModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      jest.spyOn(courseModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      } as any);

      jest.spyOn(taskModel, 'deleteOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      } as any);

      await expect(service.deleteTask('Course', 'taskId')).rejects.toThrow('Aufgabe konnte nicht gelöscht werden');
    });
  });
});