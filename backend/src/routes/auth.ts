import { Router, Request, Response, NextFunction } from 'express';
import { login, register } from '../controllers/authController';
import { AuthRequest } from '../types/auth';

const router = Router();

router.post('/register', (req: Request<{}, {}, AuthRequest>, res: Response) => {
  register(req, res);
});

router.post('/login', (req: Request<{}, {}, AuthRequest>, res: Response, next: NextFunction) => {
  login(req, res, next);
});

export default router;