import { Request, Response } from 'express';
import CourseDetail from '../models/CourseDetailSchema';

// Neuen Kurs erstellen
export const createCourseDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.create(req.body);
    return res.status(201).json(courseDetail);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Alle Kursdetails abrufen
export const getAllCourseDetails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseDetails = await CourseDetail.find();
    return res.status(200).json(courseDetails);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails nach Name abrufen
export const getCourseDetailByName = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.findOne({ courseName: req.params.courseName });
    if (!courseDetail) {
      return res.status(404).json({ message: 'Kursdetails nicht gefunden' });
    }
    return res.status(200).json(courseDetail);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails aktualisieren
export const updateCourseDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.findOneAndUpdate(
      { courseName: req.params.courseName },
      req.body,
      { new: true }
    );
    if (!courseDetail) {
      return res.status(404).json({ message: 'Kursdetails nicht gefunden' });
    }
    return res.status(200).json(courseDetail);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Kursdetails löschen
export const deleteCourseDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseDetail = await CourseDetail.findOneAndDelete({ courseName: req.params.courseName });
    if (!courseDetail) {
      return res.status(404).json({ message: 'Kursdetails nicht gefunden' });
    }
    return res.status(200).json({ message: 'Kursdetails gelöscht' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
