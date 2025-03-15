import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Role from '../models/Role';
import User from '../user/user.module';

export const assignRole = async (req: Request, res: Response) => {
  const { userId, roleId } = req.body;

  try {
    const user = await User.findById(userId);
    const role = await Role.findById(roleId);

    if (!user || !role) {
      return res.status(404).json({ message: 'Benutzer oder Rolle nicht gefunden' });
    }

    // Überprüfen, ob die Rolle bereits zugewiesen ist
    if (user.roles.includes(role._id as mongoose.Types.ObjectId)) {
      return res.status(400).json({ message: 'Rolle bereits zugewiesen' });
    }

    user.roles.push(role._id as mongoose.Types.ObjectId);
    await user.save();

    res.json({ message: 'Rolle erfolgreich zugewiesen', user });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};