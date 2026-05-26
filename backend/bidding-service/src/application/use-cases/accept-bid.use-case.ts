import { Injectable, NotFoundException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { BidAcceptedEvent } from '../../domain/events/bid-accepted.event';
import { BidRejectedEvent } from '../../domain/events/bid-rejected.event';
import { BidSelectionDomainService } from '../../domain/services/bid-selection.domain-service';

@Injectable()
export class AcceptBidUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly bidSelectionService: BidSelectionDomainService,
    private readonly events: EventPublisherService,
  ) {}

  async execute(bidId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');

    // Carrega todas as bids do projeto para o Domain Service decidir
    const projectBids = await this.bidRepo.findByProject(bid.projectId);

    // Domain Service aplica RN03: valida unicidade e seleciona vencedor
    const { winner, toReject } = this.bidSelectionService.selectWinner(bidId, projectBids);

    await this.bidRepo.save(winner);
    for (const rejected of toReject) {
      await this.bidRepo.save(rejected);
    }

    // bid.accepted — dispara project-service (assignSpecialist) e delivery-service (init tracking)
    await this.events.publishBidAccepted(
      new BidAcceptedEvent({ bidId: winner.id, projectId: winner.projectId, specialistId: winner.specialistId }),
    );

    // bid.rejected — notifica cada especialista que teve proposta recusada automaticamente (RN03)
    for (const rejected of toReject) {
      await this.events.publishBidRejected(
        new BidRejectedEvent({ bidId: rejected.id, projectId: rejected.projectId, specialistId: rejected.specialistId }),
      );
    }
  }
}
