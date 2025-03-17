import { Router } from 'express';
import authRoutes from './auth/auth.rout';
import userRoutes from './user/user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;