import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { PaymentRoutingKey } from '@shared/contracts/events/payment.events';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQService) {}

  publishPaymentCreated(payload: {
    paymentId: string;
    projectId: string;
    specialistId: string;
    amount: number;
    companyId: string;
  }) {
    return this.rabbit.publishEvent(PaymentRoutingKey.PAYMENT_CREATED, payload);
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
    return this.rabbit.publishEvent(PaymentRoutingKey.PAYMENT_RELEASED, payload);
  }

  publishWithdrawalCompleted(payload: {
    withdrawalId: string;
    specialistId: string;
    amount: number;
    method: string;
  }) {
    return this.rabbit.publishEvent(PaymentRoutingKey.WITHDRAWAL_COMPLETED, payload);
  }
}
