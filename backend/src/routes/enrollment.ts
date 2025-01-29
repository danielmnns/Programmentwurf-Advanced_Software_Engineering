import express, { NextFunction, Request, Response } from 'express';
import {
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from '../controllers/EnrollmentController';

const router = express.Router();

// Neue Einschreibung erstellen
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createEnrollment(req, res);
  } catch (err) {
    next(err);
  }
});

// Alle Einschreibungen abrufen
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllEnrollments(req, res);
  } catch (err) {
    next(err);
  }
});

// Einschreibung nach ID abrufen
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEnrollmentById(req, res);
  } catch (err) {
    next(err);
  }
});

// Einschreibung aktualisieren
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateEnrollment(req, res);
  } catch (err) {
    next(err);
  }
});

// Einschreibung löschen
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteEnrollment(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  res.send('Enrollment Route Works!');
});

export default router;
