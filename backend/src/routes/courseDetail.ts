import express, { Request, Response, NextFunction } from 'express';
import {
  createCourseDetail,
  getAllCourseDetails,
  getCourseDetailByName,
  updateCourseDetail,
  deleteCourseDetail,
} from '../controllers/CourseDetailController';

const router = express.Router();

// Neuen Kurs erstellen
router.post('/user-kurs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createCourseDetail(req, res);
  } catch (err) {
    next(err);
  }
});

// Alle Kursdetails abrufen
router.get('/user-kurs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCourseDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// Kursdetails nach Name abrufen
router.get('/user-kurs/:courseName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCourseDetailByName(req, res);
  } catch (err) {
    next(err);
  }
});

// Kursdetails aktualisieren
router.put('/user-kurs/:courseName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateCourseDetail(req, res);
  } catch (err) {
    next(err);
  }
});

// Kursdetails löschen
router.delete('/user-kurs/:courseName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCourseDetail(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
