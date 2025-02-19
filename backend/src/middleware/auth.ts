import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload; // or any other type based on your user object
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('Secret is not defined');
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Access token is missing or invalid' });
    return;
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      res.status(403).json({ message: 'Invalid token' });
      return;
    }

    req.user = user as string | jwt.JwtPayload;
    next();
  });
};