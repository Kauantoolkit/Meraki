import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitBidDto {
  @ApiProperty({ example: 'Tenho 5 anos de experiência com Flutter e NestJS. Entregarei no prazo.' })
  @IsString()
  @MinLength(20)
  proposal: string;

  @ApiProperty({ example: 4500.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  proposedBudget: number;

  @ApiProperty({ example: 60, description: 'Prazo estimado em dias' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  estimatedDuration: number;
}
