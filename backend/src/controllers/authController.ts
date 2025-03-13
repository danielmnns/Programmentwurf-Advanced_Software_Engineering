import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import Role from '../models/Role'; 
import { AuthRequestLogin, AuthResponseChangePassword, AuthResponseLogin, AuthResponseLogout, AuthResponseRegister } from '../types/auth';
import { comparePasswords } from '../utils/passwordUtils';

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

// Benutzer anmelden
export const login = async (req: Request<{}, {}, AuthRequestLogin>, res: Response<AuthResponseLogin>, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username }).populate('roles');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', token: '', user: { username: '', usertype: '' } });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    console.log('Password Valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        token: '',
        user: { username: '', usertype: '' }
      });
    }

    // Überprüfen, ob der Benutzer bereits eingeloggt ist
    if (user.isOnline) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already logged in', 
        token: '', 
        user: { username: '', usertype: '' } 
      });
    }

    // JWT-Token erstellen
    const token = jwt.sign({ username: user.username, userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Benutzer als online markieren
    user.isOnline = true;
    await user.save();

    // Rollen-Namen abrufen
    const roles = await Promise.all(user.roles.map(async (roleId) => {
      const role = await Role.findById(roleId);
      return role ? role.name : '';
    }));

    res.status(200).json({ success: true, message: 'Login successful', token, user: { 
      username: user.username, 
      usertype: roles.join(', ') 
    } });
  } catch (err) {
    next(err);
  }
};

// Benutzer abmelden (Logout)
export const logout = async (req: AuthRequest, res: Response<AuthResponseLogout>, next: NextFunction) => {
  try {
    const userId = (req.user as jwt.JwtPayload).userId;

    // Benutzer anhand der ID finden
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Benutzer als offline markieren
    user.isOnline = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};

// Passwort ändern
export const changePassword = async (req: AuthRequest, res: Response<AuthResponseChangePassword>, next: NextFunction) => {
  try {
    const userId = (req.user as jwt.JwtPayload).userId;
    const { password, newPassword } = req.body;

    // Benutzer anhand der ID finden
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Überprüfen, ob das alte Passwort korrekt ist
    const isOldPasswordValid = await comparePasswords(password, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    // Neues Passwort setzen (wird im Modell gehasht)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};