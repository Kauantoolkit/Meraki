import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Entrega do módulo de autenticação' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Implementar login, registro e recuperação de senha.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  order: number;

  @ApiPropertyOptional({ example: ['Documentação', 'Código-fonte', 'Testes'] })
  @IsOptional()
  @IsString({ each: true })
  deliverables?: string[];

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  expectedHours?: number;
}
