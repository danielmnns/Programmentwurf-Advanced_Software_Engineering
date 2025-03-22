import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUser) {
      throw new BadRequestException('Benutzername existiert bereits');
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (updateUserDto.username) {
      const existingUser = await this.userModel.findOne({ 
        username: updateUserDto.username,
        _id: { $ne: id }
      }).exec();
      
      if (existingUser) {
        throw new BadRequestException('Benutzername existiert bereits');
      }
    }
    
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
    }
    
    return updatedUser;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).exec();
  }

  async updateToken(userId: string, token: string | null): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { token },
      { new: true }
    ).exec();
  }


  async remove(username: string): Promise<void> {
    const result = await this.userModel.deleteOne({ username }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Benutzer mit Name "${username}" nicht gefunden`);
    }
  }

  async removeById(id: number): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Benutzer mit ID "${id}" nicht gefunden`);
    }
  }
}