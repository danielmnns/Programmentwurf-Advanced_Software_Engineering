import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CoursesService } from '../courses/courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;
  let coursesService: CoursesService;

  const mockTasksService = {
    getTaskDetailsForStudent: jest.fn(),
    createSubmission: jest.fn(),
    getSubmissionsForTask: jest.fn(),
    saveFeedback: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    addDocumentToTask: jest.fn(),
    createTask: jest.fn(),
    deleteSubmissionForUser: jest.fn(),
  };

  const mockCoursesService = {
    addTaskToCourse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
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

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
    coursesService = module.get<CoursesService>(CoursesService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserTaskDetails', () => {
    it('should return task details for a user', async () => {
      const courseName = 'Test Course';
      const taskName = 'Test Task';
      const userName = 'student1';
      const result = {
        taskId: 'taskId',
        taskName: 'Test Task',
        description: 'Task description',
        documents: [],
        submission: null,
      };

      mockTasksService.getTaskDetailsForStudent.mockResolvedValue(result);

      expect(await controller.getUserTaskDetails(courseName, taskName, userName)).toBe(result);
      expect(mockTasksService.getTaskDetailsForStudent).toHaveBeenCalledWith(
        courseName,
        taskName,
        userName
      );
    });
  });

  describe('getTaskDetails', () => {
    it('should return task details', async () => {
      const payload = { courseName: 'Test Course', taskName: 'Test Task' };
      const req = { user: { username: 'student1' } };
      const result = {
        taskId: 'taskId',
        taskName: 'Test Task',
        description: 'Task description',
        documents: [],
        submission: null,
      };

      mockTasksService.getTaskDetailsForStudent.mockResolvedValue(result);

      expect(await controller.getTaskDetails(payload, req)).toBe(result);
      expect(mockTasksService.getTaskDetailsForStudent).toHaveBeenCalledWith(
        payload.courseName,
        payload.taskName,
        req.user.username
      );
    });
  });

  describe('uploadSubmission', () => {
    it('should upload a submission', async () => {
      const file = {
        originalname: 'submission.pdf',
        filename: '1234567890.pdf',
      };
      const body = { courseName: 'Test Course', taskName: 'Test Task' };
      const req = { user: { username: 'student1' } };
      const result = {
        message: 'Abgabe erfolgreich gespeichert',
        submission: {
          userName: 'student1',
          file: {
            name: file.originalname,
            url: `/uploads/submissions/${file.filename}`,
          },
        },
      };

      mockTasksService.createSubmission.mockResolvedValue(result);

      expect(await controller.uploadSubmission(file, body, req)).toBe(result);
      expect(mockTasksService.createSubmission).toHaveBeenCalledWith(
        body.courseName,
        body.taskName,
        req.user.username,
        file
      );
    });

    it('should throw BadRequestException if no file', async () => {
      const body = { courseName: 'Test Course', taskName: 'Test Task' };
      const req = { user: { username: 'student1' } };

      await expect(controller.uploadSubmission(null, body, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSubmissions', () => {
    it('should return submissions for a task', async () => {
      const payload = { courseName: 'Test Course', taskName: 'Test Task' };
      const result = {
        taskName: 'Test Task',
        taskDescription: 'Task description',
        submissions: [
          {
            userName: 'student1',
            file: { name: 'submission1.pdf', url: '/path/to/submission1' },
          },
        ],
      };

      mockTasksService.getSubmissionsForTask.mockResolvedValue(result);

      expect(await controller.getSubmissions(payload)).toBe(result);
      expect(mockTasksService.getSubmissionsForTask).toHaveBeenCalledWith(
        payload.courseName,
        payload.taskName
      );
    });
  });

  describe('giveFeedback', () => {
    it('should save feedback for a submission', async () => {
      const payload = {
        courseName: 'Test Course',
        taskName: 'Test Task',
        submissionName: 'submission.pdf',
        studentName: 'student1',
        feedbackText: 'Good job',
        feedbackBy: 'teacher1',
      };
      const result = {
        message: 'Feedback erfolgreich gespeichert',
        feedback: { text: 'Good job', feedbackFrom: 'teacher1' },
      };

      mockTasksService.saveFeedback.mockResolvedValue(result);

      expect(await controller.giveFeedback(payload)).toBe(result);
      expect(mockTasksService.saveFeedback).toHaveBeenCalledWith(
        payload.courseName,
        payload.taskName,
        payload.submissionName,
        payload.studentName,
        payload.feedbackText,
        payload.feedbackBy
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskData = {
        courseName: 'Test Course',
        name: 'Test Task',
        description: 'Updated description',
      };
      const result = { message: 'Aufgabe erfolgreich aktualisiert' };

      mockTasksService.updateTask.mockResolvedValue(result);

      expect(await controller.updateTask(taskData)).toBe(result);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(taskData);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const payload = { courseName: 'Test Course', taskId: 'taskId' };
      const result = {
        message: 'Aufgabe erfolgreich gelöscht',
        deletedCount: 1,
      };

      mockTasksService.deleteTask.mockResolvedValue(result);

      expect(await controller.deleteTask(payload)).toBe(result);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(
        payload.courseName,
        payload.taskId
      );
    });
  });

  describe('addTaskDocument', () => {
    it('should add a document to a task', async () => {
      const file = {
        originalname: 'document.pdf',
        filename: '1234567890.pdf',
      };
      const body = { courseName: 'Test Course', taskId: 'taskId' };
      const result = {
        message: 'Dokument erfolgreich zur Aufgabe hinzugefügt',
        document: {
          name: file.originalname,
          url: `/uploads/taskDocuments/${file.filename}`,
        },
      };

      mockTasksService.addDocumentToTask.mockResolvedValue(result);

      expect(await controller.addTaskDocument(file, body)).toBe(result);
      expect(mockTasksService.addDocumentToTask).toHaveBeenCalledWith(
        body.courseName,
        body.taskId,
        file
      );
    });
  });

  describe('addTask', () => {
    it('should add a new task', async () => {
      const file = {
        originalname: 'task.pdf',
        filename: '1234567890.pdf',
      };
      const taskData = {
        courseName: 'Test Course',
        taskName: 'New Task',
        taskDescription: 'Description',
      };
      const task = {
        _id: 'taskId',
        ...taskData,
        documents: [
          {
            name: file.originalname,
            url: `/uploads/tasks/${file.filename}`,
          },
        ],
      };

      mockTasksService.createTask.mockResolvedValue(task);
      mockCoursesService.addTaskToCourse.mockResolvedValue({});

      const result = await controller.addTask(file, taskData);

      expect(mockTasksService.createTask).toHaveBeenCalledWith(
        taskData.courseName,
        taskData.taskName,
        taskData.taskDescription,
        file
      );
      expect(mockCoursesService.addTaskToCourse).toHaveBeenCalledWith(
        taskData.courseName,
        task
      );
      expect(result).toEqual({
        success: true,
        message: 'Aufgabe erfolgreich erstellt',
        task: task,
      });
    });

    it('should handle errors when adding a task', async () => {
      const taskData = {
        courseName: 'Test Course',
        taskName: 'New Task',
        taskDescription: 'Description',
      };

      mockTasksService.createTask.mockRejectedValue(new Error('Test error'));

      await expect(controller.addTask(null, taskData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteSubmission', () => {
    it('should delete a submission', async () => {
      const payload = { courseName: 'Test Course', taskName: 'Test Task' };
      const req = { user: { username: 'student1' } };
      const result = { message: 'Abgabe erfolgreich gelöscht' };

      mockTasksService.deleteSubmissionForUser.mockResolvedValue(result);

      expect(await controller.deleteSubmission(payload, req)).toBe(result);
      expect(mockTasksService.deleteSubmissionForUser).toHaveBeenCalledWith(
        payload.courseName,
        payload.taskName,
        req.user.username
      );
    });
  });
});