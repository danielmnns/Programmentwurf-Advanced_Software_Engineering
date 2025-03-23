import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AdminInitializerService implements OnModuleInit {
  private readonly logger = new Logger(AdminInitializerService.name);
  
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  private async createAdminIfNotExists(): Promise<void> {
    const adminExists = await this.userModel.findOne({ username: 'admin' }).exec();
    
    if (!adminExists) {
      
      const adminUser = new this.userModel({
        username: 'admin',
        password: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        userType: 'admin',
      });
      
      await adminUser.save();
      this.logger.log('Admin-Benutzer wurde erstellt');
    } else {
      this.logger.verbose('Admin-Benutzer existiert bereits');
    }
  }
}