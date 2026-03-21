import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { KanbanRepository } from '../../repositories/kanban.repository';
import { HistoryRepository } from '../../repositories/history.repository';
import { KanbanColumnFactory } from '../../../domain/factories/kanban-column.factory';

/** bid.accepted → inicializa o Kanban board e registra histórico */
@Injectable()
export class BidAcceptedConsumer implements OnModuleInit {
  private readonly logger = new Logger(BidAcceptedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly kanbanRepo: KanbanRepository,
    private readonly historyRepo: HistoryRepository,
    private readonly kanbanColumnFactory: KanbanColumnFactory,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'delivery.events.bid-accepted',
      'bid.accepted',
      async (message) => {
        const { projectId, specialistId, bidId } = message.payload || message;
        this.logger.log(`bid.accepted recebido: project=${projectId}`);

        // Usa Factory para criar as colunas padrão
        const columns = this.kanbanColumnFactory.createDefaultColumns(projectId);
        await this.kanbanRepo.saveColumns(columns);

        // RN07 — histórico automático
        await this.historyRepo.save({
          projectId,
          specialistId,
          action: 'PROJECT_STARTED',
          description: `Especialista atribuído ao projeto via proposta ${bidId}`,
        });

        this.logger.log(`Kanban board inicializado para projeto ${projectId}`);
      },
    );
  }
}
