import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  MaxLength,
  ArrayMaxSize,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecialistProfileDto {
  @ApiPropertyOptional({ example: 'Desenvolvedor Flutter com 5 anos de experiência', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: ['Flutter', 'Dart', 'Firebase'], type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 5, description: 'Anos de experiência (0–80)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(80)
  experience?: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Valor por hora (R$, máx 100000)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'https://meu-portfolio.dev', maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  website?: string;
}

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ example: 'Tech Corp Ltda', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ example: 'Tecnologia', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ example: '10-50', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  companySize?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com.br', maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  website?: string;
}
