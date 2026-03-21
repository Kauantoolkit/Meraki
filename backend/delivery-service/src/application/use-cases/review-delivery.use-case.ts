import { Injectable, NotFoundException } from '@nestjs/common';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../infrastructure/repositories/delivery.repository';
import { HistoryRepository } from '../../infrastructure/repositories/history.repository';
import { KanbanRepository } from '../../infrastructure/repositories/kanban.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneValidatedEvent } from '../../domain/events/milestone-validated.event';

@Injectable()
export class ReviewDeliveryUseCase {
  constructor(
    private readonly deliveryRepo: DeliveryRepository,
    private readonly historyRepo: HistoryRepository,
    private readonly kanbanRepo: KanbanRepository,
    private readonly events: EventPublisherService,
  ) {}

  async approve(milestoneId: string, amount: number): Promise<Delivery> {
    const delivery = await this.findSubmitted(milestoneId);

    delivery.status = DeliveryStatus.APPROVED;
    delivery.reviewedAt = new Date();
    const saved = await this.deliveryRepo.save(delivery);

    // RN07 — histórico automático
    const history = await this.historyRepo.save({
      projectId: delivery.projectId,
      specialistId: delivery.specialistId,
      action: 'MILESTONE_APPROVED',
      description: `Milestone ${milestoneId} aprovado`,
    });

    await this.kanbanRepo.updateCardStatus(milestoneId, 'APPROVED');

    // Domain Event tipado → dispara payment-service
    const event = new MilestoneValidatedEvent({
      milestoneId,
      projectId: delivery.projectId,
      amount,
      specialistId: delivery.specialistId,
    });
    await this.events.publishMilestoneValidated(event.payload);

    await this.events.publishHistoryRecorded({
      historyId: history.id,
      projectId: delivery.projectId,
      specialistId: delivery.specialistId,
      action: 'MILESTONE_APPROVED',
    });

    return saved;
  }

  async reject(milestoneId: string, reason: string): Promise<Delivery> {
    const delivery = await this.findSubmitted(milestoneId);

    delivery.status = DeliveryStatus.REJECTED;
    delivery.rejectionReason = reason;
    delivery.reviewedAt = new Date();
    const saved = await this.deliveryRepo.save(delivery);

    await this.historyRepo.save({
      projectId: delivery.projectId,
      specialistId: delivery.specialistId,
      action: 'MILESTONE_REJECTED',
      description: `Milestone ${milestoneId} rejeitado: ${reason}`,
    });

    await this.kanbanRepo.updateCardStatus(milestoneId, 'REJECTED');

    return saved;
  }

  private async findSubmitted(milestoneId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findByMilestoneAndStatus(
      milestoneId,
      DeliveryStatus.SUBMITTED,
    );
    if (!delivery) throw new NotFoundException('Entrega pendente não encontrada para este milestone');
    return delivery;
  }
}
