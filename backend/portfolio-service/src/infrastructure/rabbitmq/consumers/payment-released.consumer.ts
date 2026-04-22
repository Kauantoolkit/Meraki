import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { RecordWorkHistoryUseCase } from '../../../application/use-cases/record-work-history.use-case';

/** payment.released → registra histórico profissional (RF11, RF14) e atualiza stats */
@Injectable()
export class PaymentReleasedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentReleasedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly recordWorkHistoryUseCase: RecordWorkHistoryUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.payment-released',
      'payment.released',
      async (message) => {
        const { specialistId, projectId, specialistAmount } = message.payload || message;
        this.logger.log(`payment.released: specialist=${specialistId} earned=${specialistAmount}`);
        await this.recordWorkHistoryUseCase.execute({ specialistId, projectId, amountEarned: specialistAmount });
      },
    );
  }
}
