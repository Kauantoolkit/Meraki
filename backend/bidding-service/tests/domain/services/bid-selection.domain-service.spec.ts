import { BidSelectionDomainService } from '../../../src/domain/services/bid-selection.domain-service';
import { Bid } from '../../../src/domain/entities/bid.entity';
import { BidStatus } from '../../../src/domain/enums/bid-status.enum';
import { BidAlreadyAcceptedError } from '../../../src/domain/exceptions/bid-already-accepted.error';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createBid(id: string, status: BidStatus = BidStatus.PENDING): Bid {
  const bid = new Bid();
  bid.id = id;
  bid.projectId = 'project-1';
  bid.specialistId = `specialist-${id}`;
  bid.proposal = 'Proposta';
  bid.proposedBudget = 5000;
  bid.estimatedDuration = 30;
  bid.status = status;
  return bid;
}

describe('BidSelectionDomainService — RN03', () => {
  let service: BidSelectionDomainService;

  beforeEach(() => {
    service = new BidSelectionDomainService();
  });

  it('deve selecionar a bid vencedora e rejeitar as demais PENDING', () => {
    const bids = [createBid('bid-1'), createBid('bid-2'), createBid('bid-3')];

    const { winner, toReject } = service.selectWinner('bid-2', bids);

    expect(winner.id).toBe('bid-2');
    expect(winner.status).toBe(BidStatus.ACCEPTED);
    expect(toReject).toHaveLength(2);
    toReject.forEach((b) => expect(b.status).toBe(BidStatus.REJECTED));
  });

  it('RN03: deve lançar BidAlreadyAcceptedError quando ja existe bid aceita', () => {
    const bids = [
      createBid('bid-1', BidStatus.ACCEPTED),
      createBid('bid-2'),
    ];

    expect(() => service.selectWinner('bid-2', bids)).toThrow(BidAlreadyAcceptedError);
  });

  it('RN03: mensagem do erro deve indicar a regra de negócio', () => {
    const bids = [createBid('bid-1', BidStatus.ACCEPTED), createBid('bid-2')];

    expect(() => service.selectWinner('bid-2', bids)).toThrow(
      'Este projeto já possui um especialista selecionado (RN03)',
    );
  });

  it('deve lançar DomainException se bid não encontrada no projeto', () => {
    const bids = [createBid('bid-1')];

    expect(() => service.selectWinner('bid-inexistente', bids)).toThrow(DomainException);
  });

  it('não deve rejeitar bids que já foram WITHDRAWN', () => {
    const bids = [
      createBid('bid-1'),
      createBid('bid-2', BidStatus.WITHDRAWN),
      createBid('bid-3'),
    ];

    const { winner, toReject } = service.selectWinner('bid-1', bids);

    expect(winner.status).toBe(BidStatus.ACCEPTED);
    expect(toReject).toHaveLength(1);
    expect(toReject[0].id).toBe('bid-3');
  });

  it('não deve rejeitar bids que já foram REJECTED', () => {
    const bids = [
      createBid('bid-1'),
      createBid('bid-2', BidStatus.REJECTED),
      createBid('bid-3'),
    ];

    const { winner, toReject } = service.selectWinner('bid-1', bids);

    expect(winner.status).toBe(BidStatus.ACCEPTED);
    expect(toReject).toHaveLength(1);
    expect(toReject[0].id).toBe('bid-3');
  });

  it('deve funcionar com apenas uma bid no projeto', () => {
    const bids = [createBid('bid-1')];

    const { winner, toReject } = service.selectWinner('bid-1', bids);

    expect(winner.status).toBe(BidStatus.ACCEPTED);
    expect(toReject).toHaveLength(0);
  });
});
