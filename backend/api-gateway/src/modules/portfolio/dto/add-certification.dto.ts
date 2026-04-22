import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, IsUrl, Max, Min } from 'class-validator';

export class AddCertificationDto {
  @ApiProperty({ example: 'AWS Solutions Architect' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Amazon Web Services' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({ example: 'https://credly.com/badges/xyz' })
  @IsOptional()
  @IsUrl()
  url?: string;
}
