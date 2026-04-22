import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { KanbanRepository } from '../../repositories/kanban.repository';
import { KanbanCard } from '../../../domain/entities/kanban-card.entity';

/** milestone.created → cria card na coluna "Pendente" do Kanban */
@Injectable()
export class MilestoneCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(MilestoneCreatedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly kanbanRepo: KanbanRepository,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'delivery.events.milestone-created',
      'milestone.created',
      async (message) => {
        const { milestoneId, projectId, order } = message.payload || message;
        this.logger.log(`milestone.created: ${milestoneId} (project ${projectId})`);

        const pendingColumn = await this.kanbanRepo.findFirstColumn(projectId);

        if (!pendingColumn) {
          this.logger.warn(`Coluna Pendente não encontrada para projeto ${projectId} — bid.accepted ainda não processado?`);
          return;
        }

        const card = new KanbanCard();
        card.columnId = pendingColumn.id;
        card.milestoneId = milestoneId;
        card.title = `Milestone #${order}`;
        card.order = order;
        card.milestoneStatus = 'PENDING';

        await this.kanbanRepo.saveCard(card);
        this.logger.log(`Card criado no Kanban: milestone ${milestoneId}`);
      },
    );
  }
}
