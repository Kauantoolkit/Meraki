import { Module, Global } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Global()
@Module({
  providers: [RabbitMQConfigService],
  exports: [RabbitMQConfigService],
})
export class RabbitMQModule {}
