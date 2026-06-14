import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

export class LegallyAcceptMilestoneDto {
  invoiceId: string;
}

@Injectable()
export class LegallyAcceptMilestoneUseCase {
  constructor(
    @Inject('IProjectRepository') // Note: used via MilestoneRepository usually
    private readonly milestoneRepo: MilestoneRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(milestoneId: string, dto: LegallyAcceptMilestoneDto) {
    const milestone = await this.milestoneRepo.findById(milestoneId);
    if (!milestone) throw new NotFoundException('Milestone não encontrado');

    milestone.legallyAccept(dto.invoiceId);

    const saved = await this.milestoneRepo.save(milestone);

    const event = new MilestoneUpdatedEvent({
      milestoneId: saved.id,
      projectId: saved.projectId,
      status: saved.status,
    });

    await this.events.publishMilestoneUpdated(event);

    return saved;
  }
}
