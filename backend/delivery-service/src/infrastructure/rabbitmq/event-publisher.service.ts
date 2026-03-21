import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQConfigService) {}

  publishDeliverySubmitted(payload: { deliveryId: string; milestoneId: string; projectId: string; specialistId: string }) {
    return this.rabbit.publishEvent('delivery.submitted', payload);
  }

  publishMilestoneValidated(payload: { milestoneId: string; projectId: string; amount: number; specialistId: string }) {
    return this.rabbit.publishEvent('milestone.validated', payload);
  }

  publishHistoryRecorded(payload: { historyId: string; projectId: string; specialistId: string; action: string }) {
    return this.rabbit.publishEvent('history.recorded', payload);
  }
}
