import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQConfigService) {}

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
}
