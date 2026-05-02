// src/application/dto/create-payment-hiring.dto.ts

import { IsUUID, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreatePaymentHiringDto {
  @IsUUID('4', { message: 'specialistId must be a valid UUID v4' })
  specialistId!: string;

  @IsUUID('4', { message: 'companyId must be a valid UUID v4' })
  companyId!: string;

  @IsUUID('4', { message: 'projectId must be a valid UUID v4' })
  projectId!: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0.01' })
  @Max(999999.99, { message: 'amount must be less than 999,999.99' })
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
