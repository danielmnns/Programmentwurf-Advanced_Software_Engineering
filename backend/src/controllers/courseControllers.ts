import { Request, Response, NextFunction } from 'express';
import CourseModel from '../models/Course';
import { Course } from '../types/course';

// Kurs erstellen
export const createCourse = async (req: Request<{}, {}, Course>, res: Response, next: NextFunction) => {
  try {
    const newCourse: Course = req.body;
    const course = new CourseModel(newCourse);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    next(err);
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
    next(err);
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
    next(err);
  }
};

// Kurs löschen
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedCourse = await CourseModel.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};