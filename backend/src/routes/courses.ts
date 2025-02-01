import express, { Request, Response, NextFunction } from 'express';
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/courseControllers';
import { Course } from '../types/course';

const router = express.Router();

router.post('/', async (req: Request<{}, {}, Course>, res: Response, next: NextFunction) => {
  try {
    await createCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCourses(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getCourseById(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request<{ id: string }, {}, Course>, res: Response, next: NextFunction) => {
  try {
    await updateCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;