// src/application/dto/create-payment-hiring.dto.ts

import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentHiringDto {
  @IsUUID()
  specialistId!: string;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  projectId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
