import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolesService } from '../roles/roles.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    // Benutzer finden
    const user = await this.userModel
      .findOne({ username })
      .populate('roles')
      .exec();
      
    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    
    // Passwort überprüfen
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }
    
    // Prüfen, ob der Benutzer bereits eingeloggt ist
    if (user.isOnline) {
      throw new BadRequestException('Benutzer ist bereits angemeldet');
    }
    
    // Token erstellen
    const payload = { username: user.username, sub: user._id };
    const token = this.jwtService.sign(payload);
    
    // Benutzer als online markieren
    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();
    
    // Rollen-Namen abrufen
    const roleNames = await this.rolesService.getRoleNames(user.roles);
    
    // Frontend-kompatibles Format zurückgeben
    return {
      success: true,
      message: 'Login erfolgreich',
      token,
      user: {
        username: user.username,
        userType: roleNames.join(', ') || 'student'
      }
    };
  }

  async logout(user: any) {
    if (!user || !user.userId) {
      throw new UnauthorizedException('Nicht authentifiziert');
    }
    
    const foundUser = await this.userModel.findById(user.userId);
    if (!foundUser) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    
    foundUser.isOnline = false;
    await foundUser.save();
    
    return { success: true, message: 'Logout erfolgreich' };
  }

  async changePassword(user: any, currentPassword: string, newPassword: string) {
    if (!user || !user.userId) {
      throw new UnauthorizedException('Nicht authentifiziert');
    }
    
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Aktuelles und neues Passwort erforderlich');
    }
    
    const foundUser = await this.userModel.findById(user.userId);
    if (!foundUser) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    
    // Altes Passwort überprüfen
    const isPasswordValid = await foundUser.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }
    
    // Neues Passwort setzen
    foundUser.password = newPassword;  // Wird durch pre-save Hook gehasht
    await foundUser.save();
    
    return { success: true, message: 'Passwort erfolgreich geändert' };
  }
}