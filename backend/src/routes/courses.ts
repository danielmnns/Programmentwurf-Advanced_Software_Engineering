import express, { NextFunction, Request, Response } from 'express';
import {
  addActivity,
  createCourse,
  deleteCourse,
  enrollUser,
  getAllCourses,
  getCourseById,
  getCourseInfo,
  getEnrolledUsers,
  removeActivity,
  toggleVisibility,
  unenrollUser,
  updateCourse,
} from '../controllers/courseControllers';
import { authenticateToken } from '../middleware/auth';
import { Course } from '../types/course';

const router = express.Router();

router.post('/', authenticateToken, async (req: Request<{}, {}, Course>, res: Response, next: NextFunction) => {
  try {
    await createCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCourses(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateToken, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getCourseById(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, async (req: Request<{ id: string }, {}, Course>, res: Response, next: NextFunction) => {
  try {
    await updateCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateToken, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteCourse(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/enroll', authenticateToken, async (req: Request<{ id: string }, {}, { userId: string }>, res: Response, next: NextFunction) => {
  try {
    await enrollUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/unenroll', authenticateToken, async (req: Request<{ id: string }, {}, { userId: string }>, res: Response, next: NextFunction) => {
  try {
    await unenrollUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/add-activity', authenticateToken, async (req: Request<{ id: string }, {}, { title: string; description: string; dueDate: Date; priority: string }>, res: Response, next: NextFunction) => {
  try {
    await addActivity(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/remove-activity', authenticateToken, async (req: Request<{ id: string }, {}, { taskId: string }>, res: Response, next: NextFunction) => {
  try {
    await removeActivity(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/toggle-visibility', authenticateToken, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await toggleVisibility(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/enrolled-users', authenticateToken, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getEnrolledUsers(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/info', authenticateToken, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getCourseInfo(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;