import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Sistema de Agendamento v2' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({ example: 'Descrição atualizada do projeto.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: 7500.00 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
