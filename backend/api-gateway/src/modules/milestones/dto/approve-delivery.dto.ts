import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ApproveDeliveryDto {
  @ApiPropertyOptional({ example: 1500.00, description: 'Valor a liberar (usa valor do escrow se omitido)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
