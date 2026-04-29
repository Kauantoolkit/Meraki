// src/application/dto/create-withdrawal.dto.ts

import { IsUUID, IsNumber, IsEnum, IsString, IsOptional, Min, Max, ValidateIf } from 'class-validator';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreateWithdrawalDto {
  @IsUUID('4', { message: 'specialistId must be a valid UUID v4' })
  specialistId!: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0.01' })
  @Max(999999.99, { message: 'amount must be less than 999,999.99' })
  amount!: number;

  @IsEnum(PaymentMethod, { message: 'paymentMethod must be PIX, BANK_TRANSFER, or CREDIT_ACCOUNT' })
  paymentMethod!: PaymentMethod;

  @ValidateIf((o) => o.paymentMethod === PaymentMethod.PIX)
  @IsString({ message: 'pixKey is required for PIX withdrawals' })
  pixKey?: string;

  @ValidateIf((o) => o.paymentMethod === PaymentMethod.BANK_TRANSFER)
  @IsString({ message: 'bankAccount is required for BANK_TRANSFER withdrawals' })
  bankAccount?: string;
}
