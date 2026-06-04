import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsDateString, IsNumber, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de Agendamento' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Desenvolver um sistema de agendamento para clínica.' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: ['Flutter', 'NestJS', 'PostgreSQL'] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  requirements: string[];

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @IsPositive()
  budget: number;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  deadline: string;
}
