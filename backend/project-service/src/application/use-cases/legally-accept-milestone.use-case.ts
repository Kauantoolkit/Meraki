import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IMilestoneRepository, MILESTONE_REPOSITORY } from '../../domain/repositories/milestone.repository.interface';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

export class LegallyAcceptMilestoneDto {
  invoiceId: string;
}

@Injectable()
export class LegallyAcceptMilestoneUseCase {
  constructor(
    @Inject(MILESTONE_REPOSITORY)
    private readonly milestoneRepo: IMilestoneRepository,
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
