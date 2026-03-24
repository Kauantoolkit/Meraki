import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({ example: 'Por favor, adicione mais detalhes à documentação.' })
  @IsString()
  @MinLength(3)
  comment: string;
}
