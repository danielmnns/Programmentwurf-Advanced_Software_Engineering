import express, { NextFunction, Request, Response } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/userController';

const router = express.Router();

// Benutzer erstellen
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createUser(req, res);
  } catch (err) {
    next(err);
  }
});

// Alle Benutzer abrufen
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllUsers(req, res);
  } catch (err) {
    next(err);
  }
});

// Benutzer nach ID abrufen
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserById(req, res);
  } catch (err) {
    next(err);
  }
});

// Benutzer aktualisieren
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUser(req, res);
  } catch (err) {
    next(err);
  }
});

// Benutzer löschen
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUser(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
