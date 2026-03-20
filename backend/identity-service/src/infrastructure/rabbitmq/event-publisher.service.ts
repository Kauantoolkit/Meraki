import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbitMQ: RabbitMQConfigService) {}

  async publishUserRegistered(payload: Record<string, any>) {
    await this.rabbitMQ.publishEvent('user.registered', payload);
  }

  async publishUserUpdated(payload: Record<string, any>) {
    await this.rabbitMQ.publishEvent('user.updated', payload);
  }
}
