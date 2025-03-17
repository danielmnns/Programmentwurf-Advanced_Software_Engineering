import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly lecturer: string;

  @IsOptional()
  @IsMongoId({ each: true })
  readonly students?: string[];

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
  
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;
  
  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}