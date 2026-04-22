import { Payment, PaymentStatus } from '../../../src/domain/entities/payment.entity';
import { PaymentNotInEscrowError } from '../../../src/domain/exceptions/payment-not-in-escrow.error';

function createPayment(overrides: Partial<Payment> = {}): Payment {
  const p = new Payment();
  p.id = 'payment-1';
  p.projectId = 'project-1';
  p.milestoneId = 'milestone-1';
  p.specialistId = 'specialist-1';
  p.amount = 10000;
  p.status = PaymentStatus.ESCROW_HELD;
  Object.assign(p, overrides);
  return p;
}

describe('Payment Entity — RN06', () => {
  describe('release()', () => {
    it('deve liberar pagamento em ESCROW_HELD com taxa de 10%', () => {
      const payment = createPayment();
      const result = payment.release(0.10);

      expect(payment.status).toBe(PaymentStatus.RELEASED);
      expect(result.platformFee).toBe(1000);
      expect(result.specialistAmount).toBe(9000);
      expect(payment.platformFee).toBe(1000);
      expect(payment.specialistAmount).toBe(9000);
      expect(payment.releasedAt).toBeInstanceOf(Date);
    });

    it('RN06: deve calcular taxa corretamente com 15%', () => {
      const payment = createPayment({ amount: 2000 });
      const result = payment.release(0.15);

      expect(result.platformFee).toBe(300);
      expect(result.specialistAmount).toBe(1700);
    });

    it('deve manter precisao decimal', () => {
      const payment = createPayment({ amount: 1333.33 });
      const result = payment.release(0.10);

      expect(result.platformFee).toBe(133.33);
      expect(result.specialistAmount).toBe(1200);
    });

    it('deve impedir liberar pagamento que nao esta em ESCROW_HELD', () => {
      const payment = createPayment({ status: PaymentStatus.RELEASED });
      expect(() => payment.release(0.10)).toThrow(PaymentNotInEscrowError);
    });

    it('deve impedir liberar pagamento REFUNDED', () => {
      const payment = createPayment({ status: PaymentStatus.REFUNDED });
      expect(() => payment.release(0.10)).toThrow(PaymentNotInEscrowError);
    });

    it('deve funcionar com taxa zero', () => {
      const payment = createPayment({ amount: 5000 });
      const result = payment.release(0);

      expect(result.platformFee).toBe(0);
      expect(result.specialistAmount).toBe(5000);
    });
  });
});
