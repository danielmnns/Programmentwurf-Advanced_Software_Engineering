import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth';
import CourseModel from '../models/Course';
import TaskModel from '../models/Tasks';
import UserModel from '../models/Users';
import { Course } from '../types/course';

interface AuthRequest extends Request {
  user?: any;
}

// Kurs erstellen
export const createCourse = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, dozent } = req.body;

      // Überprüfen, ob der Benutzer die Berechtigung "read/write" hat
      if (!req.user.permissions.includes('read/write')) {
        return res.status(403).json({ success: false, message: 'User does not have permission to create a course' });
      }

      if (!title || !description || !dozent) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      console.log('Kursdaten:', req.body);

      const course = new CourseModel({ ...req.body });
      await course.save();
      res.status(201).json({ success: true, message: 'Course created successfully', course });
    } catch (err) {
      console.error('Fehler beim Erstellen des Kurses:', err);
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ success: false, message: 'Validation error', details: err.errors });
      } else if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 11000) {
        res.status(400).json({ success: false, message: 'Duplicate key error', details: (err as any).keyValue });
      } else {
        res.status(500).json({ success: false, message: 'Something went wrong during course creation', error: errorMessage });
      }
    }
  }
];

// Alle Kurse abrufen
export const getAllCourses = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const courses: Course[] = await CourseModel.find();
      res.status(200).json(courses);
    } catch (err) {
      next(err);
    }
  }
];

// Kurs nach ID abrufen
export const getCourseById = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];

// Kurs aktualisieren
export const updateCourse = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Überprüfen, ob der Benutzer die Berechtigung "read/write" hat
      if (!req.user.permissions.includes('read/write')) {
        return res.status(403).json({ success: false, message: 'User does not have permission to update the course' });
      }

      const updatedCourse = await CourseModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json(updatedCourse);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Validation error', details: err.errors });
      } else if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];

// Kurs löschen
export const deleteCourse = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Überprüfen, ob der Benutzer die Berechtigung "read/write" hat
      if (!req.user.permissions.includes('read/write')) {
        return res.status(403).json({ success: false, message: 'User does not have permission to delete the course' });
      }

      const deletedCourse = await CourseModel.findByIdAndDelete(req.params.id);
      if (!deletedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({ message: 'Course deleted' });
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];

// Benutzer einschreiben
export const enrollUser = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Überprüfen, ob das Attribut "userId" vorhanden ist
      if (!req.body.userId) {
        return res.status(400).json({ message: 'Missing userId in request body' });
      }

      // Überprüfen, ob der Benutzer in der Datenbank existiert
      const user = await UserModel.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Überprüfen, ob der Benutzer bereits eingeschrieben ist
      const isEnrolled = course.enrolled.some((id: mongoose.Types.ObjectId) => id.toString() === req.body.userId);
      if (isEnrolled) {
        return res.status(400).json({ message: 'User is already enrolled in this course' });
      }

      // Benutzer einschreiben
      course.enrolled.push(new mongoose.Types.ObjectId(req.body.userId));
      await course.save();
      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid user ID' });
      } else {
        next(err);
      }
    }
  }
];

// Benutzer austragen
export const unenrollUser = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      course.enrolled = course.enrolled.filter(id => id.toString() !== req.body.userId);
      await course.save();
      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid user ID' });
      } else {
        next(err);
      }
    }
  }
];

// Aktivität hinzufügen
export const addActivity = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id).populate('enrolled', 'role');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Filtere die eingeschriebenen Benutzer, um nur die mit der Rolle "Student" zu erhalten
      const students = course.enrolled
        .filter((user: any) => user.role === 'Student')
        .map((user: any) => new mongoose.Types.ObjectId(user._id));

      // Neues Task Model erstellen und allen eingeschriebenen Benutzern zuweisen
      const newTask = new TaskModel({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        priority: req.body.priority,
        assignedTo: students.length > 0 ? students : undefined, // Zuweisung an alle eingeschriebenen Benutzer mit der Rolle "Student"
        course: course._id
      });

      await newTask.save();

      // Task ID zum Kurs hinzufügen
      course.tasks.push(newTask._id);
      await course.save();

      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Validation error', details: err.errors });
      } else {
        next(err);
      }
    }
  }
];

// Aktivität entfernen
export const removeActivity = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const task = await TaskModel.findById(req.body.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      course.tasks = course.tasks.filter(id => id.toString() !== task._id.toString());
      await course.save();
      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid task ID' });
      } else {
        next(err);
      }
    }
  }
];

// Sichtbarkeit umschalten
export const toggleVisibility = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      course.isVisible = !course.isVisible;
      await course.save();
      res.status(200).json(course);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];

// Benutzerliste abrufen
export const getEnrolledUsers = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id).populate('enrolled', 'username email firstname lastname role profileImage isOnline');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json(course.enrolled);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];

// Kursinformationen abrufen
export const getCourseInfo = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({
        title: course.title,
        description: course.description,
        dozent: course.dozent,
        isVisible: course.isVisible,
      });
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: 'Invalid course ID' });
      } else {
        next(err);
      }
    }
  }
];