import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'ID do outro usuário com quem iniciar a conversa' })
  @IsString()
  @IsNotEmpty()
  otherUserId: string;
}
