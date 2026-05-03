import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQConfigService) {}

  publishPaymentCreated(payload: {
    paymentId: string;
    projectId: string;
    specialistId: string;
    amount: number;
    companyId: string;
  }) {
    return this.rabbit.publishEvent('payment.created', payload);
  }

  publishPaymentReleased(payload: {
    paymentId: string;
    milestoneId: string;
    projectId: string;
    amount: number;
    specialistAmount: number;
    platformFee: number;
    specialistId: string;
  }) {
    return this.rabbit.publishEvent('payment.released', payload);
  }

  publishWithdrawalCompleted(payload: {
    withdrawalId: string;
    specialistId: string;
    amount: number;
    method: string;
  }) {
    return this.rabbit.publishEvent('withdrawal.completed', payload);
  }
}
