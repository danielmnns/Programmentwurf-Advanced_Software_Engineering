import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.userService.findByUsername(username);
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    // Format an die Erwartungen des Frontends anpassen
    return {
      success: true,
      message: 'Login erfolgreich',
      user: {
        username: user.name,
        userType: user.role, // userType statt role für Frontend-Kompatibilität
        token: token, // token statt access_token
      },
    };
  }

  async changePassword(user: any, currentPassword: string, newPassword: string) {
    const dbUser = this.userService.findByUsername(user.username);
    
    if (!dbUser) {
      throw new UnauthorizedException('Benutzer nicht gefunden');
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    this.userService.update(dbUser.id, {
      ...dbUser,
      password: hashedNewPassword,
    });
    
    return {
      userName: user.username,
      passwordChangeSuccess: true
    };
  }

  async getUserData(user: any) {
    // Format an die Erwartungen des Frontends anpassen
    return {
      success: true,
      user: {
        username: user.username,
        userType: user.role,
        token: user.token,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Überprüfe, ob Benutzer bereits existiert
    if (this.userService.findByUsername(createUserDto.name)) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Registrierung erfolgreich',
      user: {
        username: user.name,
        userType: user.role,
      },
    };
  }
}