import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { 
      sub: user._id, 
      username: user.username,
      userType: user.role 
    };
    
    const token = this.jwtService.sign(payload);
    
    return {
      success: true,
      message: 'Login erfolgreich',
      user: {
        username: user.username,
        userType: user.role,
        token: token,
      }
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Überprüfen, ob Benutzer bereits existiert
    const existingUser = await this.usersService.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new BadRequestException('Benutzername existiert bereits');
    }
    
    // Benutzer erstellen
    const createdUser = await this.usersService.create({
      ...createUserDto,
      role: createUserDto.role || 'Student',
    });
    
    return {
      success: true,
      message: 'Registrierung erfolgreich',
      user: {
        username: createdUser.username,
        userType: createdUser.role,
      }
    };
  }

  async changePassword(user: any, currentPassword: string, newPassword: string) {
    const dbUser = await this.usersService.findById(user.userId);
    
    if (!dbUser) {
      throw new UnauthorizedException('Benutzer nicht gefunden');
    }
    
    const isPasswordValid = await bcrypt.compare(
      currentPassword, 
      dbUser.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }
    
    await this.usersService.updatePassword(user.userId, newPassword);
    
    return {
      userName: user.username,
      passwordChangeSuccess: true
    };
  }

  async getUserData(user: any) {
    return {
      success: true,
      user: {
        username: user.username,
        userType: user.userType,
      }
    };
  }
}