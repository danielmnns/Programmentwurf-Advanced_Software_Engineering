import { Request, Response, NextFunction } from 'express';
import Enrollment from '../models/Enrollment';
import { Enrollment as EnrollmentType } from '../types/enrollment';

// Neue Einschreibung erstellen
export const createEnrollment = async (req: Request<{}, {}, EnrollmentType>, res: Response, next: NextFunction) => {
  try {
    const enrollment = await Enrollment.create(req.body);
    res.status(201).json(enrollment);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Alle Einschreibungen abrufen
export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments: EnrollmentType[] = await Enrollment.find();
    res.status(200).json(enrollments);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Einschreibung nach ID abrufen
export const getEnrollmentById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json(enrollment);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Einschreibung aktualisieren
export const updateEnrollment = async (req: Request<{ id: string }, {}, EnrollmentType>, res: Response, next: NextFunction) => {
  try {
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json(updatedEnrollment);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Einschreibung löschen
export const deleteEnrollment = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deletedEnrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!deletedEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json({ message: 'Enrollment deleted' });
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};