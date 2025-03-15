import { BadRequestException, Injectable } from '@nestjs/common';
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
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.name,
        role: user.role,
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
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.name,
        role: user.role,
      },
    };
  }
}