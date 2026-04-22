import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitDeliveryDto {
  @ApiProperty({ description: 'ID do projeto' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: 'Notas da entrega' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'URLs dos arquivos entregues' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliveredFiles?: string[];
}
