import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Entrega do módulo de autenticação' })
  @IsString()
  @MinLength(3, { message: 'O título do milestone deve ter pelo menos 3 caracteres' })
  title: string;

  @ApiProperty({ example: 'Implementar login, registro e recuperação de senha.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
