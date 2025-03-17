import { NextFunction, Request, Response, Router } from 'express';
import { changePassword, login, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { AuthRequestChangePassword, AuthRequestLogin, AuthResponseChangePassword, AuthResponseLogin, AuthResponseLogout } from '../types/auth.type';

const router = Router();

router.post('/login', (req: Request<{}, {}, AuthRequestLogin>, res: Response<AuthResponseLogin>, next: NextFunction) => {
  login(req, res, next);
});

router.post('/change-password', authenticateToken, (req: Request<{}, {}, AuthRequestChangePassword>, res: Response<AuthResponseChangePassword>, next: NextFunction) => {
  changePassword(req, res, next);
});

router.post('/logout', authenticateToken, (req: Request, res: Response<AuthResponseLogout>, next: NextFunction) => {
  logout(req, res, next);
});

export default router;