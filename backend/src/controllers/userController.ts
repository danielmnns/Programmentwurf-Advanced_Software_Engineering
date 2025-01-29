import { Request, Response } from 'express';
import User from '../models/Users';

// Alle Benutzer abrufen
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer erstellen
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);  
    res.status(201).json(user);  
  } catch (err) {
    console.error(err);  
    res.status(500).json({ error: (err as Error).message });  
  }
};

// Benutzer nach ID abrufen
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer aktualisieren
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Benutzer löschen
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.status(200).json({ message: 'Benutzer gelöscht' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};