import express, { Request, Response, NextFunction } from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseControllers';

const router = express.Router();


router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createCourse(req, res); 
  } catch (err) {
    next(err); 
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCourses(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCourseById(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateCourse(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCourse(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
