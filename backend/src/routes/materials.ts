import express, { Request, Response, NextFunction } from 'express';
import {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materialControllers';
import { Material as MaterialType } from '../types/material';

const router = express.Router();

// Material hochladen
router.post('/', async (req: Request<{}, {}, MaterialType>, res: Response, next: NextFunction) => {
  try {
    await uploadMaterial(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Alle Materialien abrufen
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getMaterials(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Material nach ID abrufen
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await getMaterialById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Material aktualisieren
router.put('/:id', async (req: Request<{ id: string }, {}, MaterialType>, res: Response, next: NextFunction) => {
  try {
    await updateMaterial(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Material löschen
router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteMaterial(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;