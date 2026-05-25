import { Injectable, NotFoundException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { BidRejectedEvent } from '../../domain/events/bid-rejected.event';

@Injectable()
export class RejectBidUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(bidId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    bid.reject();
    await this.bidRepo.save(bid);
    await this.events.publishBidRejected(
      new BidRejectedEvent({ bidId: bid.id, projectId: bid.projectId, specialistId: bid.specialistId }),
    );
  }
}
