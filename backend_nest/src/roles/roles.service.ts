import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>
  ) {}

  async findByName(name: string): Promise<Role> {
    return this.roleModel.findOne({ name }).exec();
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const newRole = new this.roleModel(roleData);
    return newRole.save();
  }
}