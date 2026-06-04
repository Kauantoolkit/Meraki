import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum UserRole {
  COMPANY = 'COMPANY',
  SPECIALIST = 'SPECIALIST',
}

export class RegisterDto {
  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  userType: UserRole;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @ApiPropertyOptional({ example: 'Backend Development' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  specialization?: string;
}
