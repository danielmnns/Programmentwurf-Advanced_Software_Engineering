import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/Users';

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload; 
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorize = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user as any).role !== role) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
};