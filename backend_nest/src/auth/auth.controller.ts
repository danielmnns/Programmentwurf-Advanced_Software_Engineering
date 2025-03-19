import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const result = await this.authService.login(req.user);
    return {
      success: true,
      message: 'Erfolgreich angemeldet',
      user: {
        username: req.user.username,
        userType: req.user.userType
      },
      token: result.access_token
    };
  }

  @Post('register')
  async register(@Body() registerDto: { username: string; password: string; email: string }) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return {
      success: true,
      message: 'Erfolgreich abgemeldet'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('changePassword')
  async changePassword(
    @Request() req,
    @Body() passwordData: { oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(
      req.user.username, 
      passwordData.oldPassword, 
      passwordData.newPassword
    );
  }
}