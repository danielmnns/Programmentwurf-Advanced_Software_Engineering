import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import User from '../models/Users';
import { User as UserType } from '../types/user';

// Alle Benutzer abrufen
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: UserType[] = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// Benutzer erstellen
export const createUser = async (req: Request<{}, {}, UserType>, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    if (!name || !email ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
  };

// Benutzer nach ID abrufen
export const getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Benutzer aktualisieren
export const updateUser = async (req: Request<{ id: string }, {}, UserType>, res: Response, next: NextFunction) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Benutzer löschen
export const deleteUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Passwort validieren (z. B. beim Login)
export const validatePassword = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }); // Mongoose findOne-Methode
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Ungültige Anmeldedaten' });

    res.status(200).json({ message: 'Erfolgreich authentifiziert', user });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
