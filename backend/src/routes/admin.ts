import express from 'express';
import { assignRole } from '../controllers/adminController';
import authenticateToken from '../middlewares/auth';
import authorize from '../middlewares/authorize';

const router = express.Router();

router.post('/assign-role', authenticateToken, authorize('admin'), assignRole);

export default router;