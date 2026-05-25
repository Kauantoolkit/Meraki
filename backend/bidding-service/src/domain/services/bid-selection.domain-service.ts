import { Bid } from '../entities/bid.entity';
import { BidStatus } from '../enums/bid-status.enum';
import { DomainException } from '../exceptions/domain.exception';
import { BidAlreadyAcceptedError } from '../exceptions/bid-already-accepted.error';

/**
 * Domain Service — Seleção de proposta vencedora (RN03).
 * Encapsula a regra que envolve múltiplos Aggregates (vários Bids):
 * - Validar que não existe bid aceita (apenas um vencedor por projeto)
 * - Aceitar a bid escolhida
 * - Rejeitar todas as demais pendentes
 */
export class BidSelectionDomainService {
  selectWinner(bidId: string, projectBids: Bid[]): { winner: Bid; toReject: Bid[] } {
    const alreadyAccepted = projectBids.find((b) => b.status === BidStatus.ACCEPTED);
    if (alreadyAccepted) {
      throw new BidAlreadyAcceptedError();
    }

    const winner = projectBids.find((b) => b.id === bidId);
    if (!winner) throw new DomainException('Proposta não encontrada no projeto');

    winner.accept(); // invariante na entity (só aceita PENDING)

    const toReject = projectBids.filter(
      (b) => b.id !== bidId && b.status === BidStatus.PENDING,
    );
    toReject.forEach((b) => b.reject());

    return { winner, toReject };
  }
}
