import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsDateString, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMilestoneDto } from './create-milestone.dto';

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

  @ApiPropertyOptional({ type: [CreateMilestoneDto], description: 'Milestones criados junto com o projeto (atômico)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
