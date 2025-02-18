import { NextFunction, Request, Response, Router } from 'express';
import { changePassword, login, register } from '../controllers/authController';
import { IUser } from '../models/Users';
import { AuthRequestChangePassword, AuthRequestLogin, AuthResponseChangePassword, AuthResponseLogin, AuthResponseRegister } from '../types/auth';

const router = Router();

router.post('/login', (req: Request<{}, {}, AuthRequestLogin>, res: Response<AuthResponseLogin>, next: NextFunction) => {
  login(req, res, next);
});

router.post('/register', (req: Request<{}, {}, IUser>, res: Response<AuthResponseRegister>, next: NextFunction) => {
  register(req, res, next);
});

router.post('/change-password', (req: Request<{}, {}, AuthRequestChangePassword>, res: Response<AuthResponseChangePassword>, next: NextFunction) => {
  changePassword(req, res, next);
});

export default router;