import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';

@Injectable()
export class DeliveryEventConsumer implements OnModuleInit {
  private readonly logger = new Logger(DeliveryEventConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly confirmPayment: ConfirmPaymentUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'payment.events.delivery-completed',
      'delivery.completed',
      async (message) => {
        const { paymentId, milestoneId, projectId } = message.payload || message;
        this.logger.log(`delivery.completed: payment=${paymentId} milestone=${milestoneId}`);

        if (paymentId) {
          await this.confirmPayment.execute(paymentId);
        }
      },
    );

    await this.rabbit.subscribe(
      'payment.events.delivery-cancelled',
      'delivery.cancelled',
      async (message) => {
        const { paymentId, reason } = message.payload || message;
        this.logger.warn(`delivery.cancelled: payment=${paymentId} reason=${reason}`);
        // TODO: implementar refund quando delivery é cancelado
      },
    );
  }
}
