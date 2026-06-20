import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export class ProfileLinkDto {
  @ApiProperty({ example: 'GitHub' })
  @IsString() @IsNotEmpty() @MaxLength(40)
  label: string;

  @ApiProperty({ example: 'https://github.com/usuario' })
  @IsUrl()
  url: string;
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
    type: [ProfileLinkDto],
    description: 'Links pessoais (GitHub, LinkedIn, repositórios...)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProfileLinkDto)
  links?: ProfileLinkDto[];

  @ApiPropertyOptional({ example: 150.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  hourlyRate?: number;

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @ApiPropertyOptional({ example: 'https://cdn.sanity.io/images/...' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  avatarUrl?: string;
}

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ example: 'https://cdn.sanity.io/images/...' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  avatarUrl?: string;
}
