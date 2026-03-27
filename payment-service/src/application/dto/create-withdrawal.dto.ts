// src/application/dto/create-withdrawal.dto.ts

import { IsUUID, IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreateWithdrawalDto {
  @IsUUID()
  specialistId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}
