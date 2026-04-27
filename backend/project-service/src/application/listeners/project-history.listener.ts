import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProjectHistoryRepository } from '../../infrastructure/repositories/project-history.repository';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';
import { ProjectHistoryAction } from '../../domain/enums/project-history-action.enum';

@Injectable()
export class ProjectHistoryListener {
  private readonly logger = new Logger(ProjectHistoryListener.name);

  constructor(private readonly historyRepo: ProjectHistoryRepository) {}

  @OnEvent('project.created')
  async handleProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.PROJECT_CREATED,
        description: `Projeto "${event.payload.title}" criado com orçamento de R$ ${event.payload.budget}.`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de PROJECT_CREATED', err);
    }
  }

  @OnEvent('milestone.created')
  async handleMilestoneCreated(event: MilestoneCreatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.MILESTONE_CREATED,
        description: `Milestone #${event.payload.order} criado (id: ${event.payload.milestoneId}) com valor de R$ ${event.payload.amount}.`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de MILESTONE_CREATED', err);
    }
  }

  @OnEvent('milestone.updated')
  async handleMilestoneUpdated(event: MilestoneUpdatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.MILESTONE_UPDATED,
        description: `Milestone ${event.payload.milestoneId} atualizado para o status "${event.payload.status}".`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de MILESTONE_UPDATED', err);
    }
  }
}
