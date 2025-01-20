import { Request, Response } from 'express';
import User from '../models/Users'; // Mongoose Model
import * as bcrypt from 'bcrypt';

// Alle Benutzer abrufen
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Mongoose find-Methode
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer erstellen
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer nach ID abrufen
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id); // Mongoose findById-Methode
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer aktualisieren
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, ...otherData } = req.body;

    if (password) {
      otherData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: otherData },
      { new: true } // Gibt das aktualisierte Dokument zurück
    );

    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer löschen
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); // Mongoose findByIdAndDelete-Methode
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json({ message: 'Benutzer gelöscht' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
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
