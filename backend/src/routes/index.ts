import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import userRoutes from './users';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;