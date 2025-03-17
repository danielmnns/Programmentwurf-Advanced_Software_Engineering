import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  readonly username?: string;
  
  @IsOptional()
  @IsEmail()
  readonly email?: string;
  
  @IsOptional()
  @IsString()
  readonly role?: string;
}