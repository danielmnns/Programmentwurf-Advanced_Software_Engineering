import express, { Request, Response, NextFunction } from 'express';
import {
  createCourseDetail,
  getAllCourseDetails,
  getCourseDetailByName,
  updateCourseDetail,
  deleteCourseDetail,
} from '../controllers/CourseDetailController';
import { CourseDetail as CourseDetailType } from '../types/courseDetail';

const router = express.Router();

// Neuen Kurs erstellen
router.post('/user-kurs', async (req: Request<{}, {}, CourseDetailType>, res: Response, next: NextFunction) => {
  try {
    await createCourseDetail(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Alle Kursdetails abrufen
router.get('/user-kurs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCourseDetails(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Kursdetails nach Name abrufen
router.get('/user-kurs/:name', async (req: Request<{ name: string }>, res: Response, next: NextFunction) => {
  try {
    await getCourseDetailByName(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Kursdetails aktualisieren
router.put('/user-kurs/:id', async (req: Request<{ id: string }, {}, CourseDetailType>, res: Response, next: NextFunction) => {
  try {
    await updateCourseDetail(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Kursdetails löschen
router.delete('/user-kurs/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteCourseDetail(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;