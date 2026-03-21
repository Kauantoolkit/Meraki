import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Entrega do MVP' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Deve incluir as telas principais e integração básica com API' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
