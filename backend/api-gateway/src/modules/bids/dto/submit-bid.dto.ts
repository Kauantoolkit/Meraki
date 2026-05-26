import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitBidDto {
  @ApiProperty({ example: 'Tenho 5 anos de experiência com Flutter e NestJS. Entregarei no prazo.' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  proposal: string;

  @ApiProperty({ example: 4500.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  proposedBudget: number;

  @ApiProperty({ example: 60, description: 'Prazo estimado em dias (inteiro, máx 3650)' })
  @IsInt()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  estimatedDuration: number;
}
