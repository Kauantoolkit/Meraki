import { InvalidPaymentAmountError } from '../exceptions/invalid-payment-amount.error';

/**
 * Domain Service — Cálculo de taxas de pagamento (RN06).
 * A taxa é passada via construtor (injeção configurada na camada de infraestrutura).
 */
export class FeeCalculationDomainService {
  private readonly feeRate: number;

  constructor(feeRate: number) {
    this.feeRate = feeRate;
  }

  get rate(): number {
    return this.feeRate;
  }

  calculate(amount: number): { specialistAmount: number; platformFee: number } {
    if (amount <= 0) {
      throw new InvalidPaymentAmountError();
    }
    const platformFee = Number((amount * this.feeRate).toFixed(2));
    const specialistAmount = Number((amount - platformFee).toFixed(2));
    return { specialistAmount, platformFee };
  }
}
