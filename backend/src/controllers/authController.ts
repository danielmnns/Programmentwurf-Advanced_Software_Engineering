import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users';
import { Request, Response, NextFunction } from "express";
import { AuthRequest, AuthResponse } from '../types/auth';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered');
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Deine Login-Logik hier
    res.status(200).json({ message: "Login erfolgreich" });
  } catch (error) {
    next(error); // Fehler an den Error-Handler weitergeben
  }
};

