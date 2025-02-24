import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import CourseModel from '../models/Course';
import { Course } from '../types/course';

// Kurs erstellen
export const createCourse = async (req: Request<{}, {}, Course>, res: Response, next: NextFunction) => {
  try {
    const { title, description, dozent } = req.body;
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
};

// Alle Kurse abrufen
export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses: Course[] = await CourseModel.find();
    res.status(200).json(courses);
  } catch (err) {
    next(err);
  }
};

// Kurs nach ID abrufen
export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
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
};

// Kurs aktualisieren
export const updateCourse = async (req: Request<{ id: string }, {}, Course>, res: Response, next: NextFunction) => {
  try {
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
};

// Kurs löschen
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
};

// Benutzer einschreiben
export const enrollUser = async (req: Request<{ id: string }, {}, { userId: string }>, res: Response, next: NextFunction) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
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
};

// Benutzer austragen
export const unenrollUser = async (req: Request<{ id: string }, {}, { userId: string }>, res: Response, next: NextFunction) => {
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
};

// Aktivität hinzufügen
export const addActivity = async (req: Request<{ id: string }, {}, { taskId: string }>, res: Response, next: NextFunction) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    course.tasks.push(new mongoose.Types.ObjectId(req.body.taskId));
    await course.save();
    res.status(200).json(course);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid task ID' });
    } else {
      next(err);
    }
  }
};

// Aktivität entfernen
export const removeActivity = async (req: Request<{ id: string }, {}, { taskId: string }>, res: Response, next: NextFunction) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    course.tasks = course.tasks.filter(id => id.toString() !== req.body.taskId);
    await course.save();
    res.status(200).json(course);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid task ID' });
    } else {
      next(err);
    }
  }
};

// Sichtbarkeit umschalten
export const toggleVisibility = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
};

// Benutzerliste abrufen
export const getEnrolledUsers = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
};
// Kursinformationen abrufen
export const getCourseInfo = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
};