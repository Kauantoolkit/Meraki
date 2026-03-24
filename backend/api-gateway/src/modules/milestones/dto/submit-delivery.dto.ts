import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class SubmitDeliveryDto {
  @ApiProperty({ example: 'Módulo de autenticação implementado com testes unitários.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: ['Código-fonte', 'Relatório de testes'] })
  @IsString({ each: true })
  deliverables: string[];

  @ApiPropertyOptional({ example: 'https://github.com/user/repo' })
  @IsOptional()
  @IsUrl()
  repositoryUrl?: string;

  @ApiPropertyOptional({ example: 'Cobertura de testes acima de 80%.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
