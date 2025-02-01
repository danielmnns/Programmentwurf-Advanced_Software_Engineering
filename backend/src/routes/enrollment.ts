import express, { Request, Response, NextFunction } from 'express';
import {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
} from '../controllers/EnrollmentController';
import { Enrollment as EnrollmentType } from '../types/enrollment';

const router = express.Router();

// Neue Einschreibung erstellen
router.post('/', async (req: Request<{}, {}, EnrollmentType>, res: Response, next: NextFunction) => {
  try {
    await createEnrollment(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Alle Einschreibungen abrufen
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllEnrollments(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Einschreibung nach ID abrufen
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getEnrollmentById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Einschreibung aktualisieren
router.put('/:id', async (req: Request<{ id: string }, {}, EnrollmentType>, res: Response, next: NextFunction) => {
  try {
    await updateEnrollment(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Einschreibung löschen
router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteEnrollment(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;