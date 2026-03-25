import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de Agendamento' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Desenvolver um sistema de agendamento para clínica.' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['Flutter', 'NestJS', 'PostgreSQL'] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @IsPositive()
  budget: number;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  deadline: string;
}
