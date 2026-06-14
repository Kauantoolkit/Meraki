import { IsString, IsNumber, IsArray, IsDateString, MinLength, Min, ArrayMinSize, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateMilestoneDto } from './create-milestone.dto';

export class CreateProjectDto {
  @ApiProperty({ example: 'Desenvolvimento de App Mobile' })
  @IsString()
  @MinLength(10)
  title: string;

  @ApiProperty({ example: 'Precisamos de um app Flutter com...' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['Flutter', 'NestJS', 'PostgreSQL'] })
  @IsArray()
  @ArrayMinSize(1)
  requirements: string[];

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  budget: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ type: [CreateMilestoneDto], description: 'Milestones criados junto com o projeto (atômico)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
