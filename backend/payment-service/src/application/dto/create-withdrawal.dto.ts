import { IsNotEmpty, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'Valor do saque' })
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de saque' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: 'Chave PIX (obrigatória para método PIX)', required: false })
  @IsOptional()
  @IsString()
  pixKey?: string;

  @ApiProperty({ description: 'Dados bancários (para transferência)', required: false })
  @IsOptional()
  @IsString()
  bankDetails?: string;
}
