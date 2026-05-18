import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { DeliveryRoutingKey } from '@shared/contracts/events/delivery.events';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQService) {}

  publishDeliverySubmitted(payload: { deliveryId: string; milestoneId: string; projectId: string; specialistId: string }) {
    return this.rabbit.publishEvent(DeliveryRoutingKey.DELIVERY_SUBMITTED, payload);
  }

  publishMilestoneValidated(payload: { milestoneId: string; projectId: string; amount: number; specialistId: string }) {
    return this.rabbit.publishEvent(DeliveryRoutingKey.MILESTONE_VALIDATED, payload);
  }

  publishHistoryRecorded(payload: { historyId: string; projectId: string; specialistId: string; action: string }) {
    return this.rabbit.publishEvent(DeliveryRoutingKey.HISTORY_RECORDED, payload);
  }
}
