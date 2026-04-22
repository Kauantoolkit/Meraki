import { IsString, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitBidDto {
  @ApiProperty({ example: 'uuid-do-projeto' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'Tenho experiência com Flutter e NestJS. Posso entregar em 60 dias...' })
  @IsString()
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
