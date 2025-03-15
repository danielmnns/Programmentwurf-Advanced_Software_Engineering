import express, { NextFunction, Request, Response } from 'express';
import { User as UserType } from '../types/user';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUserTasks,
  updateUser,
} from '../user/user.controller';

const router = express.Router();

// Alle Benutzer abrufen
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllUsers(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Benutzer nach ID abrufen
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getUserById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Benutzer aktualisieren
router.put('/:id', async (req: Request<{ id: string }, {}, UserType>, res: Response, next: NextFunction) => {
  try {
    await updateUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Benutzer löschen
router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Aufgaben eines Benutzers abrufen
router.get('/:id/tasks', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    for (const task of getUserTasks) {
      await task(req, res, next);
    }
  } catch (err) {
    next(err);
  }
});

export default router;