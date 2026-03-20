import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../domain/enums/user-type.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserType, example: UserType.SPECIALIST })
  @IsEnum(UserType)
  userType: UserType;

  @ApiPropertyOptional({ example: 'Tech Corp Ltda', description: 'Obrigatório quando userType = COMPANY' })
  @IsOptional()
  @IsString()
  companyName?: string;
}
