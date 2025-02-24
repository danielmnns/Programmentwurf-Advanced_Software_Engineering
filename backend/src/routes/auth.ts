import { NextFunction, Request, Response, Router } from 'express';
import { login, register } from '../controllers/authController';
import { IUser } from '../models/Users';
import { AuthRequest, AuthResponse } from '../types/auth';

const router = Router();

router.post('/login', (req: Request<{}, {}, AuthRequest>, res: Response<AuthResponse>, next: NextFunction) => {
  login(req, res, next);
});

router.post('/register', (req: Request<{}, {}, IUser>, res: Response<AuthResponse>, next: NextFunction) => {
  register(req, res, next);
});

export default router;