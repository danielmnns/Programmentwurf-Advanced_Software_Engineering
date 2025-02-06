import { Request, Response, NextFunction } from 'express';
import Material from '../models/Material';
import { Material as MaterialType } from '../types/material';

// Material hochladen
export const uploadMaterial = async (req: Request<{}, {}, MaterialType>, res: Response, next: NextFunction) => {
  try {
    const { title, content, courseId } = req.body;
    const material = new Material({ title, content, courseId });
    await material.save();
    res.status(201).json(material);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Alle Materialien abrufen
export const getMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const materials: MaterialType[] = await Material.find();
    res.json(materials);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Material nach ID abrufen
export const getMaterialById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json(material);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Material aktualisieren
export const updateMaterial = async (req: Request<{ id: string }, {}, MaterialType>, res: Response, next: NextFunction) => {
  try {
    const updatedMaterial = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json(updatedMaterial);
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};

// Material löschen
export const deleteMaterial = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
    if (!deletedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json({ message: 'Material deleted' });
  } catch (err: any) {
    next(err);
    res.status(500).json({ error: err.message });
  }
};