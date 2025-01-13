import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import courseRoutes from './courses';
import materialRoutes from './materials';
import taskRoutes from './tasks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/materials', materialRoutes);
router.use('/tasks', taskRoutes);

export default router;