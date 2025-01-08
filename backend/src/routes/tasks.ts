import { Router } from 'express';
import { createTask, getTasks, submitTask } from '../controllers/taskController';

const router = Router();

router.post('/', createTask);
router.get('/', getTasks);
router.post('/:id/submit', submitTask);

export default router;