import { EscrowAccount, EscrowStatus } from '../../../src/domain/entities/escrow-account.entity';
import { Money } from '../../../src/domain/value-objects/money.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createEscrow(overrides: Partial<EscrowAccount> = {}): EscrowAccount {
  const e = new EscrowAccount();
  e.id = 'escrow-1';
  e.projectId = 'project-1';
  e.totalAmount = 0;
  e.heldAmount = 0;
  e.releasedAmount = 0;
  e.status = EscrowStatus.OPEN;
  Object.assign(e, overrides);
  return e;
}

describe('EscrowAccount Entity', () => {
  describe('holdFunds()', () => {
    it('deve reter fundos em conta OPEN', () => {
      const e = createEscrow();
      e.holdFunds(new Money(5000));

      expect(e.heldAmount).toBe(5000);
      expect(e.totalAmount).toBe(5000);
      expect(e.status).toBe(EscrowStatus.HELD);
    });

    it('deve acumular fundos retidos', () => {
      const e = createEscrow();
      e.holdFunds(new Money(3000));
      e.holdFunds(new Money(2000));

      expect(e.heldAmount).toBe(5000);
      expect(e.totalAmount).toBe(5000);
    });

    it('deve rejeitar valor zero', () => {
      const e = createEscrow();
      expect(() => e.holdFunds(new Money(0))).toThrow(DomainException);
    });

    it('deve rejeitar em conta REFUNDED', () => {
      const e = createEscrow({ status: EscrowStatus.REFUNDED });
      expect(() => e.holdFunds(new Money(1000))).toThrow(DomainException);
    });

    it('deve rejeitar em conta FULLY_RELEASED', () => {
      const e = createEscrow({ status: EscrowStatus.FULLY_RELEASED });
      expect(() => e.holdFunds(new Money(1000))).toThrow(DomainException);
    });
  });

  describe('releaseFunds()', () => {
    it('deve liberar fundos parcialmente', () => {
      const e = createEscrow({ status: EscrowStatus.HELD, heldAmount: 5000, totalAmount: 5000 });
      e.releaseFunds(new Money(2000));

      expect(e.heldAmount).toBe(3000);
      expect(e.releasedAmount).toBe(2000);
      expect(e.status).toBe(EscrowStatus.PARTIALLY_RELEASED);
    });

    it('deve liberar tudo e mudar para FULLY_RELEASED', () => {
      const e = createEscrow({ status: EscrowStatus.HELD, heldAmount: 5000, totalAmount: 5000 });
      e.releaseFunds(new Money(5000));

      expect(e.heldAmount).toBe(0);
      expect(e.releasedAmount).toBe(5000);
      expect(e.status).toBe(EscrowStatus.FULLY_RELEASED);
    });

    it('deve rejeitar liberacao maior que valor retido', () => {
      const e = createEscrow({ status: EscrowStatus.HELD, heldAmount: 1000 });
      expect(() => e.releaseFunds(new Money(2000))).toThrow(DomainException);
    });

    it('deve rejeitar em conta OPEN', () => {
      const e = createEscrow({ status: EscrowStatus.OPEN });
      expect(() => e.releaseFunds(new Money(100))).toThrow(DomainException);
    });

    it('deve permitir liberacao em conta PARTIALLY_RELEASED', () => {
      const e = createEscrow({
        status: EscrowStatus.PARTIALLY_RELEASED,
        heldAmount: 3000,
        totalAmount: 5000,
        releasedAmount: 2000,
      });
      e.releaseFunds(new Money(1000));
      expect(e.heldAmount).toBe(2000);
      expect(e.releasedAmount).toBe(3000);
    });
  });

  describe('refund()', () => {
    it('deve reembolsar conta HELD', () => {
      const e = createEscrow({ status: EscrowStatus.HELD, heldAmount: 5000 });
      e.refund();

      expect(e.heldAmount).toBe(0);
      expect(e.status).toBe(EscrowStatus.REFUNDED);
    });

    it('deve rejeitar reembolso de conta ja reembolsada', () => {
      const e = createEscrow({ status: EscrowStatus.REFUNDED });
      expect(() => e.refund()).toThrow(DomainException);
    });

    it('deve rejeitar reembolso de conta FULLY_RELEASED', () => {
      const e = createEscrow({ status: EscrowStatus.FULLY_RELEASED });
      expect(() => e.refund()).toThrow(DomainException);
    });

    it('deve rejeitar reembolso sem fundos retidos', () => {
      const e = createEscrow({ status: EscrowStatus.HELD, heldAmount: 0 });
      expect(() => e.refund()).toThrow(DomainException);
    });
  });
});
