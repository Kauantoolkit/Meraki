import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt, IsNumber, IsOptional, IsString, IsArray,
  ValidateNested, Max, Min, MinLength, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BidMilestoneProposalDto } from './submit-bid.dto';

export class UpdateBidDto {
  @ApiPropertyOptional({ example: 'Revisando minha proposta com nova abordagem...' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  proposal?: string;

  @ApiPropertyOptional({ example: 4000.00 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  proposedBudget?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  estimatedDuration?: number;

  @ApiPropertyOptional({ type: [BidMilestoneProposalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BidMilestoneProposalDto)
  milestoneProposals?: BidMilestoneProposalDto[];
}
