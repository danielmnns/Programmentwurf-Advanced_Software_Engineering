import express, { Request, Response, NextFunction } from 'express';
import { createTask, getTasks, submitTask } from '../controllers/taskController';
import { Task as TaskType, Submission as SubmissionType } from '../types/task';

const router = express.Router();

router.post('/', async (req: Request<{}, {}, TaskType>, res: Response, next: NextFunction) => {
  try {
    await createTask(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTasks(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit', async (req: Request<{ id: string }, {}, SubmissionType>, res: Response, next: NextFunction) => {
  try {
    await submitTask(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;