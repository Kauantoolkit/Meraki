import { IsString, IsOptional, IsNumber, Min, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecialistProfileDto {
  @ApiPropertyOptional({ example: 'Desenvolvedor Flutter com 5 anos de experiência' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['Flutter', 'Dart', 'Firebase'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 5, description: 'Anos de experiência' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experience?: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Valor por hora (R$)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ example: 'Tech Corp Ltda' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: '10-50' })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com.br' })
  @IsOptional()
  @IsString()
  website?: string;
}
