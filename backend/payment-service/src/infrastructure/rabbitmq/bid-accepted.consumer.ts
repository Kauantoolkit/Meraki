import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { CreateEscrowOnBidAcceptedUseCase } from '../../application/use-cases/create-escrow-on-bid-accepted.use-case';

/**
 * Consome bid.accepted (publicado pelo bidding-service)
 * Cria Payment por milestone + EscrowAccount para o projeto.
 */
@Injectable()
export class BidAcceptedConsumer implements OnModuleInit {
  private readonly logger = new Logger(BidAcceptedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly createEscrow: CreateEscrowOnBidAcceptedUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'payment.events.bid-accepted',
      'bid.accepted',
      async (message) => {
        const { projectId, specialistId, proposedBudget } = message.payload || message;
        this.logger.log(`bid.accepted: projeto=${projectId} budget=${proposedBudget}`);
        await this.createEscrow.execute({ projectId, specialistId, proposedBudget });
      },
    );
  }
}
