import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { IdentityRoutingKey } from '@shared/contracts/events/identity.events';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbitMQ: RabbitMQService) {}

  async publishUserRegistered(payload: Record<string, any>) {
    await this.rabbitMQ.publishEvent(IdentityRoutingKey.USER_REGISTERED, payload);
  }

  async publishUserUpdated(payload: Record<string, any>) {
    await this.rabbitMQ.publishEvent(IdentityRoutingKey.USER_UPDATED, payload);
  }
}
