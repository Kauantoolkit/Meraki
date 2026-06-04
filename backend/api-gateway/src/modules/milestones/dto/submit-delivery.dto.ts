import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitDeliveryDto {
  @ApiProperty({ description: 'ID do projeto' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: 'Notas da entrega' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'URLs dos arquivos entregues' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  deliveredFiles?: string[];
}
