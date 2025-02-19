import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { AuthRequestLogin, AuthResponseChangePassword, AuthResponseLogin, AuthResponseLogout, AuthResponseRegister } from '../types/auth';
import { comparePasswords } from '../utils/passwordUtils';

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

// Benutzer registrieren
export const register = async (req: Request<{}, {}, IUser>, res: Response<AuthResponseRegister>, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions, profileImage, settings } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !role || !permissions || !settings) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('Registrierungsdaten:', req.body);

    const user = await User.create({ ...req.body, password });
    res.status(201).json({ success: true, message: 'User registered successfully', user });
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Something went wrong during registration' });
  }
};

// Benutzer anmelden
export const login = async (req: Request<{}, {}, AuthRequestLogin>, res: Response<AuthResponseLogin>, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username });
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

    // Benutzer als online markieren
    user.isOnline = true;
    await user.save();

    // JWT-Token erstellen
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful', token, user: { 
      username: user.username, 
      usertype: user.role 
    }  });
  } catch (err) {
    next(err);
  }
};

// Benutzer abmelden (Logout)
export const logout = async (req: AuthRequest, res: Response<AuthResponseLogout>, next: NextFunction) => {
  try {
    const username = (req.user as jwt.JwtPayload).username;

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username });
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
    const username = (req.user as jwt.JwtPayload).username;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Überprüfen, ob die neuen Passwörter übereinstimmen
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    // Benutzer anhand des Benutzernamens finden
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Überprüfen, ob das alte Passwort korrekt ist
    const isOldPasswordValid = await comparePasswords(oldPassword, user.password);
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