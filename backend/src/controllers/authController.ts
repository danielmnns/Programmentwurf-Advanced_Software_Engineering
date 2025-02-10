import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { Request, Response, NextFunction } from "express";
import { AuthRequest, AuthResponse } from '../types/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen Benutzer erstellen
    const user = await User.create({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
};

export const login = async (req: Request<{}, {}, AuthRequest>, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username }) as IUser;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT-Token erstellen
    const token = jwt.sign({username: user.username }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Login-Response erstellen
    const loginResponse: AuthResponse = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        profileImage: user.profileImage,
        settings: user.settings,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    res.status(200).json(loginResponse);
  } catch (error) {
    next(error); // Fehler an den Error-Handler weitergeben
  }
};