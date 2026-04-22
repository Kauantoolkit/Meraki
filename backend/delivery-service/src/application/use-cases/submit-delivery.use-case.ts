import { Injectable, ConflictException } from '@nestjs/common';
import { DeliveryStatus } from '../../domain/entities/delivery.entity';
import { DeliveryFactory, CreateDeliveryData } from '../../domain/factories/delivery.factory';
import { DeliveryRepository } from '../../infrastructure/repositories/delivery.repository';
import { HistoryRepository } from '../../infrastructure/repositories/history.repository';
import { KanbanRepository } from '../../infrastructure/repositories/kanban.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { DeliverySubmittedEvent } from '../../domain/events/delivery-submitted.event';

export interface SubmitDeliveryDto {
  milestoneId: string;
  projectId: string;
  deliveredFiles?: string[];
  deliveryNotes?: string;
}

@Injectable()
export class SubmitDeliveryUseCase {
  constructor(
    private readonly deliveryRepo: DeliveryRepository,
    private readonly historyRepo: HistoryRepository,
    private readonly kanbanRepo: KanbanRepository,
    private readonly deliveryFactory: DeliveryFactory,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: SubmitDeliveryDto, specialistId: string) {
    const existing = await this.deliveryRepo.findByMilestoneAndStatus(
      dto.milestoneId,
      DeliveryStatus.SUBMITTED,
    );
    if (existing) {
      throw new ConflictException('Já existe uma entrega pendente de revisão para este milestone');
    }

    const deliveryData: CreateDeliveryData = {
      milestoneId: dto.milestoneId,
      projectId: dto.projectId,
      specialistId,
      deliveryNotes: dto.deliveryNotes,
      deliveredFiles: dto.deliveredFiles,
    };

    const delivery = this.deliveryFactory.create(deliveryData);
    const saved = await this.deliveryRepo.save(delivery);

    // RN07: registrar histórico automaticamente
    const history = await this.historyRepo.save({
      projectId: dto.projectId,
      specialistId,
      action: 'MILESTONE_SUBMITTED',
      description: `Entrega submetida para o milestone ${dto.milestoneId}`,
    });

    await this.kanbanRepo.updateCardStatus(dto.milestoneId, 'SUBMITTED');

    await this.events.publishHistoryRecorded({
      historyId: history.id,
      projectId: dto.projectId,
      specialistId,
      action: 'MILESTONE_SUBMITTED',
    });

    // Domain Event tipado
    const event = new DeliverySubmittedEvent({
      deliveryId: saved.id,
      milestoneId: dto.milestoneId,
      projectId: dto.projectId,
      specialistId,
    });
    await this.events.publishDeliverySubmitted(event.payload);

    return saved;
  }
}
