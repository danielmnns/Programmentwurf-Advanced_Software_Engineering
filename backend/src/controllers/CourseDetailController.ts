import { Request, Response, NextFunction } from 'express';
import CourseDetail from '../models/CourseDetailSchema';
import { CourseDetail as CourseDetailType } from '../types/courseDetail';

// Neuen Kurs erstellen
export const createCourseDetail = async (req: Request<{}, {}, CourseDetailType>, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.create(req.body);
    return res.status(201).json(courseDetail);
  } catch (err: any) {
    next(err);
    return res.status(500).json({ error: err.message });
  }
};

// Alle Kursdetails abrufen
export const getAllCourseDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const courseDetails: CourseDetailType[] = await CourseDetail.find();
    return res.status(200).json(courseDetails);
  } catch (err: any) {
    next(err);
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails nach Name abrufen
export const getCourseDetailByName = async (req: Request<{ name: string }>, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.findOne({ courseName: req.params.name });
    if (!courseDetail) {
      return res.status(404).json({ message: 'Course detail not found' });
    }
    return res.status(200).json(courseDetail);
  } catch (err: any) {
    next(err);
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails aktualisieren
export const updateCourseDetail = async (req: Request<{ id: string }, {}, CourseDetailType>, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const updatedCourseDetail = await CourseDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourseDetail) {
      return res.status(404).json({ message: 'Course detail not found' });
    }
    return res.status(200).json(updatedCourseDetail);
  } catch (err: any) {
    next(err);
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails löschen
export const deleteCourseDetail = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const deletedCourseDetail = await CourseDetail.findByIdAndDelete(req.params.id);
    if (!deletedCourseDetail) {
      return res.status(404).json({ message: 'Course detail not found' });
    }
    return res.status(200).json({ message: 'Course detail deleted' });
  } catch (err: any) {
    next(err);
    return res.status(500).json({ error: err.message });
  }
};