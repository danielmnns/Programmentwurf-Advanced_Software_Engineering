import { NextFunction, Request, Response } from 'express';
import User from '../models/Users';
import { User as UserType } from '../types/user';
import { hashPassword } from '../utils/passwordUtils';
import Tasks from '../models/Tasks';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

// Alle Benutzer abrufen
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: UserType[] = await User.find();
    res.status(200).json(users);
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
    const { password, ...updateData } = req.body;
    if (password) {
      const hashedPassword = await hashPassword(password);
      (updateData as UserType).password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

// Aufgaben für einen bestimmten Benutzer abrufen
export const getUserTasks = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
      const tasks = await Tasks.find({ assignedTo: userId });

      if (!tasks) {
        return res.status(404).json({ message: 'No tasks found for this user' });
      }

      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  }
];