import { Module, Global } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { EventPublisherService } from './event-publisher.service';

@Global()
@Module({
  providers: [RabbitMQConfigService, EventPublisherService],
  exports: [RabbitMQConfigService, EventPublisherService],
})
export class RabbitMQModule {}
