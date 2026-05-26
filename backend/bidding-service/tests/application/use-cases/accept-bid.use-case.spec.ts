import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AcceptBidUseCase } from '../../../src/application/use-cases/accept-bid.use-case';
import { BidSelectionDomainService } from '../../../src/domain/services/bid-selection.domain-service';
import { Bid } from '../../../src/domain/entities/bid.entity';
import { BidStatus } from '../../../src/domain/enums/bid-status.enum';
import { BidAlreadyAcceptedError } from '../../../src/domain/exceptions/bid-already-accepted.error';
import { BidNotPendingError } from '../../../src/domain/exceptions/bid-not-pending.error';

// ─── helpers ─────────────────────────────────────────────────────────────────

function createBid(overrides: Partial<Bid> = {}): Bid {
  const bid = new Bid();
  bid.id = 'bid-1';
  bid.projectId = 'project-1';
  bid.specialistId = 'spec-1';
  bid.proposal = 'Proposta de teste';
  bid.proposedBudget = 5000;
  bid.estimatedDuration = 30;
  bid.status = BidStatus.PENDING;
  return Object.assign(bid, overrides);
}

function makeMocks() {
  const bidRepo = {
    findById: jest.fn(),
    findByProject: jest.fn(),
    saveWinnerAtomically: jest.fn().mockResolvedValue(undefined),
  };

  const events = {
    publishBidAccepted: jest.fn().mockResolvedValue(undefined),
  };

  // BidSelectionDomainService é puro — usa instância real
  const domainService = new BidSelectionDomainService();

  const useCase = new AcceptBidUseCase(
    bidRepo as never,
    domainService,
    events as never,
  );

  return { bidRepo, events, useCase };
}

// ─── testes ──────────────────────────────────────────────────────────────────

describe('AcceptBidUseCase', () => {
  describe('Aceitação válida', () => {
    it('aceita a proposta e rejeita as demais PENDING do projeto', async () => {
      const winner = createBid({ id: 'bid-1', specialistId: 'spec-1' });
      const loser1 = createBid({ id: 'bid-2', specialistId: 'spec-2' });
      const loser2 = createBid({ id: 'bid-3', specialistId: 'spec-3' });

      const { bidRepo, events, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(winner);
      bidRepo.findByProject.mockResolvedValue([winner, loser1, loser2]);

      await useCase.execute('bid-1', undefined);

      expect(bidRepo.saveWinnerAtomically).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'bid-1', status: BidStatus.ACCEPTED }),
        'project-1',
      );
      expect(events.publishBidAccepted).toHaveBeenCalledTimes(1);
    });

    it('publica evento bid.accepted com dados corretos', async () => {
      const bid = createBid({ id: 'bid-1', projectId: 'proj-99', specialistId: 'spec-7' });

      const { bidRepo, events, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await useCase.execute('bid-1', undefined);

      const published = events.publishBidAccepted.mock.calls[0][0];
      expect(published.payload).toEqual({
        bidId: 'bid-1',
        projectId: 'proj-99',
        specialistId: 'spec-7',
      });
    });

    it('aceita sem problemas quando o caller é empresa (callerSpecialistId = undefined)', async () => {
      const bid = createBid();
      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await expect(useCase.execute('bid-1', undefined)).resolves.not.toThrow();
    });
  });

  describe('Proposta não encontrada', () => {
    it('lança NotFoundException quando a proposta não existe', async () => {
      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('id-inexistente', undefined)).rejects.toThrow(NotFoundException);
    });
  });

  describe('RN03 — unicidade do vencedor', () => {
    it('lança BidAlreadyAcceptedError quando projeto já tem vencedor', async () => {
      const existingWinner = createBid({ id: 'bid-0', status: BidStatus.ACCEPTED, specialistId: 'spec-0' });
      const newBid = createBid({ id: 'bid-1', specialistId: 'spec-1' });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(newBid);
      bidRepo.findByProject.mockResolvedValue([existingWinner, newBid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow(BidAlreadyAcceptedError);
    });

    it('não publica evento quando RN03 impede a aceitação', async () => {
      const existingWinner = createBid({ id: 'bid-0', status: BidStatus.ACCEPTED });
      const newBid = createBid({ id: 'bid-1' });

      const { bidRepo, events, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(newBid);
      bidRepo.findByProject.mockResolvedValue([existingWinner, newBid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow();
      expect(events.publishBidAccepted).not.toHaveBeenCalled();
    });
  });

  describe('Autorização — especialista não pode aceitar própria proposta', () => {
    it('lança ForbiddenException quando especialista tenta aceitar a própria proposta', async () => {
      const bid = createBid({ id: 'bid-1', specialistId: 'spec-1' });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);

      await expect(useCase.execute('bid-1', 'spec-1')).rejects.toThrow(ForbiddenException);
    });

    it('não consulta o projeto quando o caller é o próprio especialista (fail fast)', async () => {
      const bid = createBid({ specialistId: 'spec-1' });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);

      await expect(useCase.execute('bid-1', 'spec-1')).rejects.toThrow();
      expect(bidRepo.findByProject).not.toHaveBeenCalled();
    });

    it('permite aceitação quando callerSpecialistId é diferente do specialistId da proposta', async () => {
      const bid = createBid({ id: 'bid-1', specialistId: 'spec-1' });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await expect(useCase.execute('bid-1', 'spec-outro')).resolves.not.toThrow();
    });
  });

  describe('Proposta em estado inválido', () => {
    it('lança BidNotPendingError ao tentar aceitar proposta já REJECTED', async () => {
      const bid = createBid({ status: BidStatus.REJECTED });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow(BidNotPendingError);
    });

    it('lança BidNotPendingError ao tentar aceitar proposta já WITHDRAWN', async () => {
      const bid = createBid({ status: BidStatus.WITHDRAWN });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow(BidNotPendingError);
    });

    it('lança BidNotPendingError ao tentar aceitar proposta já ACCEPTED', async () => {
      const bid = createBid({ status: BidStatus.ACCEPTED });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([bid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow();
    });
  });

  describe('Consistência — não persiste nem publica em caso de erro', () => {
    it('não chama saveWinnerAtomically se domainService lançar erro', async () => {
      const existingWinner = createBid({ id: 'bid-0', status: BidStatus.ACCEPTED });
      const bid = createBid({ id: 'bid-1' });

      const { bidRepo, useCase } = makeMocks();
      bidRepo.findById.mockResolvedValue(bid);
      bidRepo.findByProject.mockResolvedValue([existingWinner, bid]);

      await expect(useCase.execute('bid-1', undefined)).rejects.toThrow();
      expect(bidRepo.saveWinnerAtomically).not.toHaveBeenCalled();
    });
  });
});
