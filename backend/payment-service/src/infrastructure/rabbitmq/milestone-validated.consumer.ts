import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { DeliveryRoutingKey } from '@shared/contracts/events/delivery.events';
import { ReleasePaymentUseCase } from '../../application/use-cases/release-payment.use-case';

/**
 * Consome milestone.validated (publicado pelo delivery-service)
 * Delega ao ReleasePaymentUseCase — camada de aplicação.
 */
@Injectable()
export class MilestoneValidatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(MilestoneValidatedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly releasePaymentUseCase: ReleasePaymentUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'payment.events.milestone-validated',
      DeliveryRoutingKey.MILESTONE_VALIDATED,
      async (message) => {
        const { milestoneId, projectId, amount, specialistId } = message.payload || message;
        this.logger.log(`milestone.validated: milestone=${milestoneId} amount=${amount}`);
        await this.releasePaymentUseCase.execute({ milestoneId, projectId, amount, specialistId });
      },
    );
  }
}
