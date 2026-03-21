import { IsString, IsNumber, IsArray, IsDateString, IsOptional, MinLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  requirements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
