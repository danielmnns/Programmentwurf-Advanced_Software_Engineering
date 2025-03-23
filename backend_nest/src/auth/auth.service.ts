import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('🔍 Validate User aufgerufen:', username);
    const user = await this.usersService.findByUsername(username);
    console.log('🔍 User in DB gefunden:', !!user);
    
    if (!user) {
      console.log('❌ Benutzer nicht gefunden');
      return null;
    }
    
    console.log('🔍 Vergleiche Passwörter:', password, '(eingegebenes Passwort)');
    console.log('🔍 Mit hash in DB:', user.password.substring(0, 10) + '...');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 Passwort gültig:', isPasswordValid);
    
    if (isPasswordValid) {
      const { password, ...result } = user.toObject();
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username, 
      sub: user._id,
      role: user.userType // wichtig für Rollenbasierte Zugriffskontrolle
    };
    
    const token = this.jwtService.sign(payload);
    
    // Aktualisiere den Token im Benutzer-Dokument
    await this.usersService.updateToken(user._id.toString(), token);
    
    return {
      access_token: token,
    };
  }

  async register(registerDto: any) {
    return this.usersService.create({
      username: registerDto.username,
      password: registerDto.password,
      email: registerDto.email,
      userType: 'student' // Standardrolle für neue Benutzer
    });
  }

  async logout(userId: string) {
    return this.usersService.updateToken(userId, null);
  }

  async changePassword(username: string, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findByUsername(username);
    
    if (!user) {
      throw new UnauthorizedException('Benutzer nicht gefunden');
    }
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Korrektur hier: toString() verwenden, um _id in einen String zu konvertieren
    await this.usersService.updatePassword(user._id.toString(), hashedPassword);
    
    return { passwordChangeSuccess: true };
  }
}