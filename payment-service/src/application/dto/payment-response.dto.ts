// src/application/dto/payment-response.dto.ts

import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentType } from '../../domain/enums/payment-type.enum';

export class PaymentResponseDto {
  id!: string;
  specialistId!: string;
  companyId!: string;
  projectId!: string;
  amount!: number;
  type!: PaymentType;
  status!: PaymentStatus;
  pixQrCode?: string;
  transactionId?: string;
  description?: string;
  createdAt!: Date;
  updatedAt!: Date;
  completedAt?: Date;
}
