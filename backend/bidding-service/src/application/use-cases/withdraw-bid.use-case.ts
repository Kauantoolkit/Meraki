import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { BidWithdrawnEvent } from '../../domain/events/bid-withdrawn.event';

@Injectable()
export class WithdrawBidUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(bidId: string, specialistId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    if (bid.specialistId !== specialistId) throw new ForbiddenException('Não autorizado');
    bid.withdraw();
    await this.bidRepo.save(bid);

    await this.events.publishBidWithdrawn(
      new BidWithdrawnEvent({ bidId: bid.id, projectId: bid.projectId, specialistId: bid.specialistId }),
    );
  }
}
