import { IsString, IsOptional, IsArray, IsUrl, IsDateString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, ValidateNested, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileLinkDto {
  @ApiProperty({ example: 'GitHub' })
  @IsString() @IsNotEmpty() @MaxLength(40)
  label: string;

  @ApiProperty({ example: 'https://github.com/usuario' })
  @IsUrl()
  url: string;
}

export class CreatePortfolioItemDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  technologies?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  endDate?: string;
}

export class UpdatePortfolioItemDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  technologies?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}

export class AddCertificationDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  issuer: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  credentialId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  credentialUrl?: string;
}

export class CreateReviewDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  specialistId: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  projectId: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  reviewerId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  comment?: string;
}

export class UpdateMyProfileDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ type: [ProfileLinkDto], description: 'Links pessoais (GitHub, LinkedIn, repos...)' })
  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => ProfileLinkDto)
  links?: ProfileLinkDto[];

  @ApiPropertyOptional({ example: 'https://cdn.sanity.io/images/...' })
  @IsOptional() @IsString() @IsUrl()
  avatarUrl?: string;
}

export class AddSkillDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  skill: string;
}

export class AddMyCertificationDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  institution: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  credentialUrl?: string;
}
