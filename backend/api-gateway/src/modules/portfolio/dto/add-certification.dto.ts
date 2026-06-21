import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class AddCertificationDto {
  @ApiProperty({ example: 'AWS Solutions Architect' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Amazon Web Services' })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional({ example: 'https://credly.com/badges/xyz' })
  @IsOptional()
  @IsUrl()
  credentialUrl?: string;
}
