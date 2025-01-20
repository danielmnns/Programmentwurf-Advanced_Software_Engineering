import Enrollment from '../models/Enrollment.js';
import { Request, Response } from 'express';

// Neue Einschreibung erstellen
export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const enrollment = await Enrollment.create(req.body);
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Alle Einschreibungen abrufen
export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const enrollments = await Enrollment.find();
    res.status(200).json(enrollments);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Einschreibung nach ID abrufen
export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Einschreibung nicht gefunden' });
    res.status(200).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Einschreibung aktualisieren
export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enrollment) return res.status(404).json({ message: 'Einschreibung nicht gefunden' });
    res.status(200).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Einschreibung löschen
export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Einschreibung nicht gefunden' });
    res.status(200).json({ message: 'Einschreibung gelöscht' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
