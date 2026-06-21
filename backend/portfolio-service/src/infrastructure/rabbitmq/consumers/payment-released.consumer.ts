import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { RecordWorkHistoryUseCase } from '../../../application/use-cases/record-work-history.use-case';

const PROJECT_URL = process.env.PROJECT_SERVICE_URL || 'http://project-service:3002';
const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://identity-service:3001';
const API_KEY = process.env.INTERNAL_API_KEY || 'meraki-internal-key';

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
        const { specialistId, projectId, milestoneId, specialistAmount } = message.payload || message;
        this.logger.log(`payment.released: specialist=${specialistId} earned=${specialistAmount}`);

        // Enrich with project/milestone/company data
        let projectTitle = '';
        let milestoneTitle = '';
        let companyName = '';

        try {
          const headers = { 'X-API-Key': API_KEY };

          // Fetch project + milestones from project-service (internal endpoints)
          const [projRes, msRes] = await Promise.all([
            fetch(`${PROJECT_URL}/api/internal/projects/${projectId}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${PROJECT_URL}/api/internal/projects/${projectId}/milestones`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          ]);

          if (projRes) {
            projectTitle = projRes.title || '';
            // Fetch company name from identity-service (internal endpoint)
            if (projRes.companyId) {
              const compRes = await fetch(`${IDENTITY_URL}/api/internal/users/${projRes.companyId}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
              companyName = compRes?.name || '';
            }
          }

          if (msRes && milestoneId) {
            const ms = Array.isArray(msRes) ? msRes.find((m: any) => m.id === milestoneId) : null;
            milestoneTitle = ms?.title || '';
          }
        } catch (err) {
          this.logger.warn(`Erro ao enriquecer dados do payment.released: ${err}`);
        }

        await this.recordWorkHistoryUseCase.execute({
          specialistId,
          projectId,
          amountEarned: specialistAmount,
          projectTitle,
          milestoneTitle,
          companyName,
        });
      },
    );
  }
}
