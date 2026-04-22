import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  COMPANY = 'COMPANY',
  SPECIALIST = 'SPECIALIST',
}

export class RegisterDto {
  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  userType: UserRole;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Backend Development' })
  @IsOptional()
  @IsString()
  specialization?: string;
}
