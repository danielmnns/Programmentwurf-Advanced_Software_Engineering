import { Request, Response } from 'express';
import Course from '../models/Course';
// Kurs erstellen
export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Alle Kurse abrufen
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Kurs nach ID abrufen
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs nicht gefunden' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Kurs aktualisieren
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Kurs nicht gefunden' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Kurs löschen
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs nicht gefunden' });
    res.status(200).json({ message: 'Kurs gelöscht' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};