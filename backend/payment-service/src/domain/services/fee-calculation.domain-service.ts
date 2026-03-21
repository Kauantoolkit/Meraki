import { Injectable } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Domain Service — Cálculo de taxas de pagamento (RN06).
 * Encapsula a regra: plataforma retém 10% de cada pagamento liberado.
 * Separado da entity para facilitar mudança futura da taxa sem afetar o aggregate.
 */
@Injectable()
export class FeeCalculationDomainService {
  private readonly feeRate: number;

  constructor() {
    this.feeRate = parseFloat(process.env.PLATFORM_FEE_RATE || '0.10');
  }

  calculate(amount: number): { specialistAmount: number; platformFee: number } {
    if (amount <= 0) {
      throw new DomainException('Valor do pagamento deve ser maior que zero (RN06)');
    }
    const platformFee = Number((amount * this.feeRate).toFixed(2));
    const specialistAmount = Number((amount - platformFee).toFixed(2));
    return { specialistAmount, platformFee };
  }
}
