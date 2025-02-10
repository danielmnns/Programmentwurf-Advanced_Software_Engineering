import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { AuthRequest, AuthResponse } from '../types/auth';
import { generateSalt, hashPassword, verifyPassword } from '../utils/passwordUtils';

// Benutzer registrieren
export const register = async (req: Request<{}, {}, IUser>, res: Response<AuthResponse>, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions, profileImage, settings } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !role || !permissions || !settings) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    console.log('Generated Salt:', salt);
    console.log('Hashed Password:', hashedPassword);

    const user = await User.create({ ...req.body, password: hashedPassword, salt });
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

    console.log('Salt from DB:', user.salt);
    console.log('Stored Password:', user.password);

    const isPasswordValid = verifyPassword(password, user.password, user.salt);
    if (!isPasswordValid) {
      const hashedInputPassword = hashPassword(password, user.salt);
      console.log('Input Password:', hashedInputPassword);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials', 
        inputPassword: hashedInputPassword, 
        storedPassword: user.password,
        salt: user.salt
      });
    }

    // JWT-Token erstellen
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    next(err);
  }
}