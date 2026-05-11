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
  Matches,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const COMPANY_INDUSTRIES = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Finanças',
  'Varejo',
  'Indústria',
  'Construção',
  'Agronegócio',
  'Serviços',
  'Outros',
] as const;
export type CompanyIndustry = (typeof COMPANY_INDUSTRIES)[number];

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

  @ApiPropertyOptional({
    example: '12345678000190',
    description: 'CNPJ apenas dígitos (14 caracteres)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'cnpj deve ter exatamente 14 dígitos' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'Tecnologia', enum: COMPANY_INDUSTRIES })
  @IsOptional()
  @IsString()
  @IsIn(COMPANY_INDUSTRIES as unknown as string[], {
    message: `industry deve ser um de: ${COMPANY_INDUSTRIES.join(', ')}`,
  })
  industry?: CompanyIndustry;

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
