import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateEscrowDto {
  @ApiProperty({ example: 'uuid-do-milestone' })
  @IsString()
  @IsUUID()
  milestoneId: string;

  @ApiProperty({ example: 'uuid-do-projeto' })
  @IsString()
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'uuid-do-especialista' })
  @IsString()
  @IsUUID()
  specialistId: string;
}
