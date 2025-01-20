import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users';
import { Request, Response, NextFunction } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ where: { username } });
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Passwort überprüfen
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT-Token erstellen
    const token = jwt.sign({ id: user.id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    next(error); // Fehler an den Error-Handler weitergeben
  }
};