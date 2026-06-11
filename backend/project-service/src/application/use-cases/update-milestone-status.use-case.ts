import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

export type MilestoneAction = 'start' | 'submit' | 'approve' | 'reject' | 'legallyAccept';

@Injectable()
export class UpdateMilestoneStatusUseCase {
  constructor(
    private readonly milestoneRepo: MilestoneRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
  ) {}

  async execute(milestoneId: string, action: MilestoneAction) {
    const milestone = await this.milestoneRepo.findById(milestoneId);
    if (!milestone) throw new NotFoundException('Milestone não encontrado');

    if (action === 'start') {
      const allMilestones = await this.milestoneRepo.findByProject(milestone.projectId);
      milestone.start(allMilestones);
    } else if (action === 'submit') {
      milestone.submit();
    } else if (action === 'approve') {
      milestone.approve();
    } else if (action === 'legallyAccept') {
      // Aqui precisaremos de um invoiceId, que deve vir do DTO
      // Como a assinatura do método execute é fixa (id, action),
      // vou ajustar para aceitar um payload opcional.
      throw new Error('Ação legallyAccept requer invoiceId. Use o novo endpoint de aceite legal.');
    } else if (action === 'reject') {
      milestone.reject();
    }

    const saved = await this.milestoneRepo.save(milestone);

    const event = new MilestoneUpdatedEvent({
      milestoneId: saved.id,
      projectId: saved.projectId,
      status: saved.status,
    });

    await this.events.publishMilestoneUpdated(event);
    this.emitter.emit('milestone.updated', event);

    return saved;
  }
}
