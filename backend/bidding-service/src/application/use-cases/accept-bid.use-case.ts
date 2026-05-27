import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  /**
   * @param bidId           ID da proposta a ser aceita
   * @param callerSpecialistId  specialistId do usuário autenticado (undefined se empresa)
   */
  async execute(bidId: string, callerSpecialistId: string | undefined): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');

    // Especialista não pode aceitar a própria proposta
    if (callerSpecialistId && bid.specialistId === callerSpecialistId) {
      throw new ForbiddenException('Especialista não pode aceitar a própria proposta');
    }

    const projectBids = await this.bidRepo.findByProject(bid.projectId);

    // Domain Service valida RN03 e muta status em memória
    const { winner, toReject } = this.bidSelectionService.selectWinner(bidId, projectBids);

    // Infraestrutura persiste atomicamente: salva vencedor + rejeita demais em uma transação
    await this.bidRepo.saveWinnerAtomically(winner, bid.projectId);

    // bid.accepted dispara project-service (assignSpecialist) e delivery-service
    await this.events.publishBidAccepted(
      new BidAcceptedEvent({
        bidId: winner.id,
        projectId: winner.projectId,
        specialistId: winner.specialistId,
      }),
    );

    // bid.rejected — notifica cada especialista que teve proposta recusada automaticamente (RN03)
    for (const rejected of toReject) {
      await this.events.publishBidRejected(
        new BidRejectedEvent({ bidId: rejected.id, projectId: rejected.projectId, specialistId: rejected.specialistId }),
      );
    }
  }
}
