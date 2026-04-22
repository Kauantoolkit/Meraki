import { Injectable, ConflictException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { BidSubmittedEvent } from '../../domain/events/bid-submitted.event';
import { BidStatus } from '../../domain/enums/bid-status.enum';
import { BidFactory } from '../../domain/factories/bid.factory';
import { SubmitBidDto } from '../dto/submit-bid.dto';

@Injectable()
export class SubmitBidUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly bidFactory: BidFactory,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: SubmitBidDto, specialistId: string) {
    // RN02: especialista só pode ter UMA proposta ativa por projeto
    const existing = await this.bidRepo.findByProjectAndSpecialist(dto.projectId, specialistId);
    const hasActive = existing.some((b) => b.status === BidStatus.PENDING);
    if (hasActive) {
      throw new ConflictException('Especialista já possui uma proposta ativa neste projeto (RN02)');
    }

    // Factory garante que o Bid nasce consistente
    const bid = this.bidFactory.create({
      projectId: dto.projectId,
      specialistId,
      proposal: dto.proposal,
      proposedBudget: dto.proposedBudget,
      estimatedDuration: dto.estimatedDuration,
    });

    const saved = await this.bidRepo.save(bid);

    await this.events.publishBidSubmitted(
      new BidSubmittedEvent({ bidId: saved.id, projectId: saved.projectId, specialistId: saved.specialistId }),
    );

    return saved;
  }
}
