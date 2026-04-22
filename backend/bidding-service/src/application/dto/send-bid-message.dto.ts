import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBidMessageDto {
  @ApiProperty({ description: 'Texto da mensagem', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
