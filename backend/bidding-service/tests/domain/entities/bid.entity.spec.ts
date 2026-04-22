import { Bid } from '../../../src/domain/entities/bid.entity';
import { BidStatus } from '../../../src/domain/enums/bid-status.enum';
import { BidNotPendingError } from '../../../src/domain/exceptions/bid-not-pending.error';

function createBid(overrides: Partial<Bid> = {}): Bid {
  const bid = new Bid();
  bid.id = 'bid-1';
  bid.projectId = 'project-1';
  bid.specialistId = 'specialist-1';
  bid.proposal = 'Proposta de teste';
  bid.proposedBudget = 5000;
  bid.estimatedDuration = 30;
  bid.status = BidStatus.PENDING;
  Object.assign(bid, overrides);
  return bid;
}

describe('Bid Entity', () => {
  describe('accept()', () => {
    it('deve aceitar uma bid PENDING', () => {
      const bid = createBid();
      bid.accept();
      expect(bid.status).toBe(BidStatus.ACCEPTED);
    });

    it('deve rejeitar aceitar bid ACCEPTED', () => {
      const bid = createBid({ status: BidStatus.ACCEPTED });
      expect(() => bid.accept()).toThrow(BidNotPendingError);
    });

    it('deve rejeitar aceitar bid REJECTED', () => {
      const bid = createBid({ status: BidStatus.REJECTED });
      expect(() => bid.accept()).toThrow(BidNotPendingError);
    });

    it('deve rejeitar aceitar bid WITHDRAWN', () => {
      const bid = createBid({ status: BidStatus.WITHDRAWN });
      expect(() => bid.accept()).toThrow(BidNotPendingError);
    });
  });

  describe('reject()', () => {
    it('deve rejeitar uma bid PENDING', () => {
      const bid = createBid();
      bid.reject();
      expect(bid.status).toBe(BidStatus.REJECTED);
    });

    it('deve falhar ao rejeitar bid que nao e PENDING', () => {
      const bid = createBid({ status: BidStatus.ACCEPTED });
      expect(() => bid.reject()).toThrow(BidNotPendingError);
    });
  });

  describe('withdraw()', () => {
    it('deve retirar uma bid PENDING', () => {
      const bid = createBid();
      bid.withdraw();
      expect(bid.status).toBe(BidStatus.WITHDRAWN);
    });

    it('deve falhar ao retirar bid que nao e PENDING', () => {
      const bid = createBid({ status: BidStatus.REJECTED });
      expect(() => bid.withdraw()).toThrow(BidNotPendingError);
    });
  });
});
