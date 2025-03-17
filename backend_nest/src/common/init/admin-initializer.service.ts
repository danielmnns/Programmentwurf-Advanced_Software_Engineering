import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../roles/schemas/role.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AdminInitializerService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.initializeRoles();
    await this.initializeAdmin();
  }

  private async initializeRoles() {
    const roles = ['admin', 'studiengangsleiter', 'dozent', 'student'];
    
    for (const roleName of roles) {
      const existingRole = await this.roleModel.findOne({ name: roleName }).exec();
      if (!existingRole) {
        await this.roleModel.create({ name: roleName });
        console.log(`Rolle ${roleName} erstellt`);
      }
    }
  }

  private async initializeAdmin() {
    // Admin-Rolle finden
    const adminRole = await this.roleModel.findOne({ name: 'admin' }).exec();
    if (!adminRole) {
      console.error('Admin-Rolle nicht gefunden');
      return;
    }

    // Prüfen, ob ein Admin-Benutzer existiert
    const adminExists = await this.userModel.findOne({ roles: adminRole._id }).exec();
    if (adminExists) {
      console.log('Admin-Benutzer existiert bereits');
      return;
    }

    // Admin-Benutzer erstellen
    const newAdmin = await this.userModel.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin', // Wird durch Pre-Save-Hook gehasht
      firstName: 'Admin',
      lastName: 'User',
      roles: [adminRole._id],
      isOnline: false,
      settings: {
        language: 'de',
        theme: 'light'
      }
    });

    console.log('Admin-Benutzer erfolgreich erstellt');
  }
}