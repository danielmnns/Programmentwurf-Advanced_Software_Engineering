import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { AuthRequest, AuthResponse } from '../types/auth';
import { hashPassword, comparePasswords } from '../utils/passwordUtils';

// Benutzer registrieren
export const register = async (req: Request<{}, {}, IUser>, res: Response<AuthResponse>, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions, profileImage, settings } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !role || !permissions || !settings) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json({ success: true, message: 'User registered successfully', user });
  } catch (err) {
    next(err);
  }
};

// Benutzer anmelden
export const login = async (req: Request<{}, {}, AuthRequest>, res: Response<AuthResponse>, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        inputPassword: password,
        storedPassword: user.password
      });
    }

    // JWT-Token erstellen
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    next(err);
  }
};