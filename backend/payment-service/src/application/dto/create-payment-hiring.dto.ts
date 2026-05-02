import { IsNotEmpty, IsPositive, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentHiringDto {
  @ApiProperty({ description: 'ID do projeto' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'ID do especialista' })
  @IsNotEmpty()
  @IsString()
  specialistId: string;

  @ApiProperty({ description: 'ID do milestone (opcional)' })
  @IsOptional()
  @IsString()
  milestoneId?: string;

  @ApiProperty({ description: 'Valor do pagamento' })
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Descrição do pagamento' })
  @IsOptional()
  @IsString()
  description?: string;
}
