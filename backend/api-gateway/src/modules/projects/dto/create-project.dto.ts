import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de Agendamento' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Desenvolver um sistema de agendamento para clínica.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @IsPositive()
  budget: number;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ example: 'Backend Development' })
  @IsOptional()
  @IsString()
  category?: string;
}
