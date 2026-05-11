import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { ContractRepository } from '../../infrastructure/repositories/contract.repository';
import { ContractFactory } from '../../domain/factories/contract.factory';
import { ContractType } from '../../domain/enums/contract-type.enum';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

export type MilestoneAction = 'start' | 'submit' | 'approve' | 'reject';

@Injectable()
export class UpdateMilestoneStatusUseCase {
  constructor(
    private readonly milestoneRepo: MilestoneRepository,
    private readonly contractRepo: ContractRepository,
    private readonly contractFactory: ContractFactory,
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
    } else if (action === 'reject') {
      milestone.reject();
    }

    const saved = await this.milestoneRepo.save(milestone);

    if (action === 'approve') {
      const contract = this.contractFactory.create({
        projectId: saved.projectId,
        milestoneId: saved.id,
        type: ContractType.MILESTONE,
        title: `Contrato de entrega do milestone "${saved.title}"`,
        content: `O milestone "${saved.title}" foi aprovado pelo cliente. Valor: R$ ${saved.amount.toFixed(2)}. Entrega aceita e contrato de milestone finalizado.`,
      });
      await this.contractRepo.save(contract);
    }

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
