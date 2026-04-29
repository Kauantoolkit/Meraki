// src/application/dto/withdrawal-response.dto.ts

import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class WithdrawalResponseDto {
  id!: string;
  specialistId!: string;
  amount!: number;
  paymentMethod!: PaymentMethod;
  pixKey?: string;
  bankAccount?: string;
  status!: WithdrawalStatus;
  approvedAt?: Date;
  processedAt?: Date;
  rejectionReason?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
