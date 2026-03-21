import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { DomainException } from '../exceptions/domain.exception';

export interface CreatePaymentData {
  milestoneId: string;
  projectId: string;
  specialistId: string;
  amount: number;
}

@Injectable()
export class PaymentFactory {
  create(data: CreatePaymentData): Payment {
    if (!data.milestoneId) throw new DomainException('milestoneId é obrigatório');
    if (!data.projectId) throw new DomainException('projectId é obrigatório');
    if (!data.specialistId) throw new DomainException('specialistId é obrigatório');
    if (!data.amount || data.amount <= 0) throw new DomainException('amount deve ser maior que zero');

    const payment = new Payment();
    payment.milestoneId = data.milestoneId;
    payment.projectId = data.projectId;
    payment.specialistId = data.specialistId;
    payment.amount = data.amount;
    payment.status = PaymentStatus.ESCROW_HELD;
    payment.escrowTransactionId = `escrow-${Date.now()}`;

    return payment;
  }
}
