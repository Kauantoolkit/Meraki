import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ReleasePaymentDto {
  @ApiProperty({ example: 'uuid-do-milestone' })
  @IsString()
  @IsUUID()
  milestoneId: string;
}
