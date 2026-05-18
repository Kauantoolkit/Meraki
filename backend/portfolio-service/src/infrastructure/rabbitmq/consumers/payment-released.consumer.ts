import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { PaymentRoutingKey } from '@shared/contracts/events/payment.events';
import { RecordWorkHistoryUseCase } from '../../../application/use-cases/record-work-history.use-case';

/** payment.released -> registra historico profissional (RF11, RF14) e atualiza stats */
@Injectable()
export class PaymentReleasedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentReleasedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly recordWorkHistoryUseCase: RecordWorkHistoryUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.payment-released',
      PaymentRoutingKey.PAYMENT_RELEASED,
      async (message) => {
        const { specialistId, projectId, specialistAmount } = message.payload || message;
        this.logger.log(`payment.released: specialist=${specialistId} earned=${specialistAmount}`);
        await this.recordWorkHistoryUseCase.execute({ specialistId, projectId, amountEarned: specialistAmount });
      },
    );
  }
}
