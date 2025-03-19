import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Aktuelle Benutzerdaten abrufen
  @Get('user/userdata')
  @UseGuards(JwtAuthGuard)
  async getUserData(@Req() req) {
    const user = await this.usersService.findByUsername(req.user.username);
    return { 
      success: true, 
      user: {
        username: user.username,
        userType: user.userType,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      } 
    };
  }

  // Alle Benutzer abrufen (für Adminbereich)
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      user: {
        username: user.username,
        userType: user.userType,
        token: user.token || null
      }
    }));
  }

  // Benutzer erstellen
  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async create(@Body() createUserDto: { username: string; password: string; userType: string }) {
    return this.usersService.create(createUserDto);
  }

  // Benutzer aktualisieren
  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  // Benutzer löschen
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}