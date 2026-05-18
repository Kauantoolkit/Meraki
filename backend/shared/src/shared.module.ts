import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './infra/messaging/rabbitmq.service';
import { SharedMessagingService } from './infra/messaging/shared-messaging.service';

@Global()
@Module({
  providers: [RabbitMQService, SharedMessagingService],
  exports: [RabbitMQService, SharedMessagingService],
})
export class SharedModule {}
