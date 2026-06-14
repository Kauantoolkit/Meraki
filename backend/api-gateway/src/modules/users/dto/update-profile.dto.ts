import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: 'Desenvolvedor apaixonado por arquitetura de sistemas.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['Flutter', 'NestJS'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  skills?: string[];
}
