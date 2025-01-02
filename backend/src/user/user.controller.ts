import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Get()
    findAll(): User[] {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id): User {
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto): string {
        return `Name: ${createUserDto.name} Password: ${createUserDto.password}`;
    }

    @Delete(':id')
    delete(@Param('id') id) {
return `Delete user ${id}`;
    }

    @Put(':id')
    update(@Body() updateUserDto: CreateUserDto, @Param('id') id) {
        return `Update user ${id} - Name: ${updateUserDto.name}`;
    }
}
