import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../domain/enums/user-type.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'joao@empresa.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Senha123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'João Silva', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ enum: UserType, example: UserType.SPECIALIST })
  @IsEnum(UserType)
  userType: UserType;

  @ApiPropertyOptional({ example: 'Tech Corp Ltda', maxLength: 255, description: 'Obrigatório quando userType = COMPANY' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;
}
