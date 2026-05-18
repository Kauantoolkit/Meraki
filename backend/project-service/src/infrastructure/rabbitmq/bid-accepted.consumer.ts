import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { BiddingRoutingKey } from '@shared/contracts/events/bidding.events';
import { AssignSpecialistUseCase } from '../../application/use-cases/assign-specialist.use-case';

/** Consome o evento bid.accepted publicado pelo bidding-service */
@Injectable()
export class BidAcceptedConsumer implements OnModuleInit {
  private readonly logger = new Logger(BidAcceptedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly assignSpecialist: AssignSpecialistUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'project.events.bid-accepted',
      BiddingRoutingKey.BID_ACCEPTED,
      async (message) => {
        const { projectId, specialistId, bidId } = message.payload || message;
        this.logger.log(`bid.accepted recebido: project=${projectId} specialist=${specialistId}`);
        await this.assignSpecialist.execute(projectId, specialistId, bidId);
      },
    );
  }
}
