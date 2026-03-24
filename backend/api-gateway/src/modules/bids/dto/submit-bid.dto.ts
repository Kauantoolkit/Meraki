import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class SubmitBidDto {
  @ApiProperty({ example: 4500.00 })
  @IsNumber()
  @IsPositive()
  proposedValue: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  estimatedDeadline: string;

  @ApiProperty({ example: 'Utilizarei NestJS e PostgreSQL para construir a solução.' })
  @IsString()
  @MinLength(20)
  technicalProposal: string;

  @ApiPropertyOptional({ example: 'Tenho 5 anos de experiência com projetos similares.' })
  @IsOptional()
  @IsString()
  coverLetter?: string;
}
