import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('admin/user-verwaltung')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'studiengangsleiter')
async getUsersForAdmin() {
  const users = await this.usersService.findAll();
  return users.map(user => ({
    user: {
      username: user.username,
      userType: user.userType,
      token: user.token || null
    }
  }));
}

@Post('admin/user-verwaltung')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'studiengangsleiter')
async updateUserFromAdmin(@Body() updateData: any) {
  try {
    // Prüfen, welche Operation durchgeführt werden soll
    if (updateData.operation === 'updateUserType') {
      // Benutzerrolle aktualisieren
      const { username, newUserType } = updateData;
      const user = await this.usersService.findByUsername(username);
      
      if (!user) {
        throw new NotFoundException(`Benutzer ${username} nicht gefunden`);
      }
      
      // Prüfen, ob der Benutzer ein Admin ist und ob dies der letzte Admin wäre
      if (user.userType === 'admin' && newUserType !== 'admin') {
        const adminCount = await this.usersService.countAdmins();
        if (adminCount <= 1) {
          return {
            success: false,
            message: 'Diese Aktion kann nicht durchgeführt werden: Es muss immer mindestens ein Administrator im System vorhanden sein.'
          };
        }
      }
      
      user.userType = newUserType;
      await user.save();
      
      return {
        success: true,
        message: `Benutzertyp für ${username} auf ${newUserType} aktualisiert`
      };
    } 
    else if (updateData.operation === 'deleteUserById') {
      const { userId } = updateData;
      
      // Benutzer finden, um zu prüfen, ob er ein Admin ist
      const user = await this.usersService.findById(userId);
      
      // Prüfen, ob der Benutzer ein Admin ist und ob dies der letzte Admin wäre
      if (user.userType === 'admin') {
        const adminCount = await this.usersService.countAdmins();
        if (adminCount <= 1) {
          return {
            success: false,
            message: 'Diese Aktion kann nicht durchgeführt werden: Es muss immer mindestens ein Administrator im System vorhanden sein.'
          };
        }
      }
      
      await this.usersService.removeById(userId);
      
      return {
        success: true,
        message: `Benutzer mit ID ${userId} wurde gelöscht`
      };
    }
    else if (updateData.operation === 'createUser') {
      const newUser = await this.usersService.create({
        username: updateData.username,
        password: updateData.password,
        userType: updateData.userType || 'student'
      });
      
      return {
        success: true,
        message: `Benutzer ${newUser.username} wurde erstellt`,
        user: {
          username: newUser.username,
          userType: newUser.userType
        }
      };
    }
    else {
      throw new BadRequestException('Unbekannte Operation');
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

  // Alle Benutzer abrufen (für Adminbereich)
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'studiengangsleiter')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      user: {   
        _id: user._id,
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