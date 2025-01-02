import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  @Get()
  findAll(): string {
    return 'Get all users';
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return `User ${id}`;
    }

  @Post()
  create(@Body() createUserDto: CreateUserDto): string {
    return `Name: ${createUserDto.name}, Password: ${createUserDto.password}`;
  }

  @Delete(':id')
  delete(@Param('id') id): string {
    return `Delete user ${id}`;
  }

  @Put(':id')
  update(@Body() updateUserDto: UpdateUserDto, @Param(':id') id): string {
    return `Update user ${id} - Name: ${updateUserDto.name}`;
  }
}
