import { Request, Response } from 'express';
import Material from '../models/Material';

export const uploadMaterial = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const material = new Material({ title, content });
  await material.save();
  res.status(201).json(material);
};

export const getMaterials = async (req: Request, res: Response) => {
  const materials = await Material.find();
  res.json(materials);
};