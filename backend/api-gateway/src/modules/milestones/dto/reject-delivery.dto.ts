import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectDeliveryDto {
  @ApiProperty({ example: 'Os testes unitários estão ausentes.' })
  @IsString()
  @MinLength(5)
  reason: string;
}
