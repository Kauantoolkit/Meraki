import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDeliveryDto {
  @ApiProperty({ description: 'ID do milestone sendo entregue' })
  @IsString()
  milestoneId: string;

  @ApiProperty({ description: 'ID do projeto' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'URLs dos arquivos entregues' })
  @IsOptional()
  @IsArray()
  deliveredFiles?: string[];

  @ApiPropertyOptional({ description: 'Notas da entrega' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
