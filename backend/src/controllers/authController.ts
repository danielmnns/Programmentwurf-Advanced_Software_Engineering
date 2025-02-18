import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { AuthRequest, AuthResponse } from '../types/auth';
import { comparePasswords } from '../utils/passwordUtils'; // Entferne hashPassword

// Benutzer registrieren
export const register = async (req: Request<{}, {}, IUser>, res: Response<AuthResponse>, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions, profileImage, settings } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !role || !permissions || !settings) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('Registrierungsdaten:', req.body);

    const user = await User.create({ ...req.body, password });
    res.status(201).json({ success: true, message: 'User registered successfully', user });
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Something went wrong during registration', error: errorMessage });
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
    console.log('Password Valid:', isPasswordValid);

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