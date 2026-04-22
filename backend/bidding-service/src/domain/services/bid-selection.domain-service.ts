import { Bid } from '../entities/bid.entity';
import { BidStatus } from '../enums/bid-status.enum';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Domain Service — Seleção de proposta vencedora (RN03).
 * Encapsula a regra que envolve múltiplos Aggregates (vários Bids):
 * - Validar que não existe bid aceito (apenas um vencedor por projeto)
 * - Aceitar a bid escolhida
 * - Rejeitar todas as demais pendentes
 */
export class BidSelectionDomainService {
  /**
   * Valida e seleciona a bid vencedora a partir de um conjunto de bids do projeto.
   * @param bidId ID da bid a ser aceita
   * @param projectBids Todas as bids do projeto
   * @returns A bid aceita com status atualizado
   */
  selectWinner(bidId: string, projectBids: Bid[]): { winner: Bid; toReject: Bid[] } {
    const alreadyAccepted = projectBids.find((b) => b.status === BidStatus.ACCEPTED);
    if (alreadyAccepted) {
      throw new DomainException('Este projeto já possui um especialista selecionado (RN03)');
    }

    const winner = projectBids.find((b) => b.id === bidId);
    if (!winner) throw new DomainException('Proposta não encontrada');

    winner.accept(); // invariante na entity (só aceita PENDING)

    const toReject = projectBids.filter(
      (b) => b.id !== bidId && b.status === BidStatus.PENDING,
    );
    toReject.forEach((b) => b.reject());

    return { winner, toReject };
  }
}
