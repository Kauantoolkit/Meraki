import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class SharedMessagingService {
  private readonly logger = new Logger(SharedMessagingService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(
    routingKey: string,
    payload: Record<string, any>,
  ): Promise<void> {
    await this.rabbitMQService.publishEvent(routingKey, payload);
  }

  async subscribe(
    queue: string,
    routingKey: string,
    callback: (msg: any) => void,
  ): Promise<void> {
    await this.rabbitMQService.subscribe(queue, routingKey, callback);
  }
}
