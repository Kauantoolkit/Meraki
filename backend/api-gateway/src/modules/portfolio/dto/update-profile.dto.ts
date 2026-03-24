import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsString as IsStringArr } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export class UpdatePortfolioProfileDto {
  @ApiPropertyOptional({ example: 'Especialista em desenvolvimento de sistemas distribuídos.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['Node.js', 'PostgreSQL', 'Docker'] })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  hourlyRate?: number;

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;
}
