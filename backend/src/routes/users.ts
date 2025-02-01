import express, { Request, Response, NextFunction } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/userController';
import { User as UserType } from '../types/user';

const router = express.Router();

// Benutzer erstellen
router.post('/', async (req: Request<{}, {}, UserType>, res: Response, next: NextFunction) => {
  try {
    await createUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

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

export default router;