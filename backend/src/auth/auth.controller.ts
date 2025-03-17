import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(@Request() req, @Body() body: { userName: string; password: string; newPassword: string }) {
    return this.authService.changePassword(req.user, body.password, body.newPassword);
  }
  
  @Post('logout')
  @HttpCode(200)
  async logout() {
    return { success: true, message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/userdata')
  getUserData(@Request() req) {
    return this.authService.getUserData(req.user);
  }
}