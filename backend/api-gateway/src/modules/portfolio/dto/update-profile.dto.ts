import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export class UpdatePortfolioProfileDto {
  @ApiPropertyOptional({ example: 'Especialista em desenvolvimento de sistemas distribuídos.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: ['Node.js', 'PostgreSQL', 'Docker'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Links pessoais (GitHub, LinkedIn, repositórios...)',
    example: [{ label: 'GitHub', url: 'https://github.com/usuario' }],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  links?: Array<{ label: string; url: string }>;

  @ApiPropertyOptional({ example: 150.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  hourlyRate?: number;

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;
}
