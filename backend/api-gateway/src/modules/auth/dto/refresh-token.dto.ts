import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token emitido pelo /auth/login ou /auth/refresh anterior' })
  @IsString()
  @MaxLength(2048)
  refreshToken: string;
}
