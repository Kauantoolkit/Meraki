import { Injectable, Inject } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception';

export const FEE_RATE_TOKEN = 'PLATFORM_FEE_RATE';

/**
 * Domain Service — Cálculo de taxas de pagamento (RN06).
 * A taxa é injetada pelo módulo (infrastructure) para manter o domínio
 * livre de dependências de processo/ambiente (process.env).
 */
@Injectable()
export class FeeCalculationDomainService {
  private readonly feeRate: number;

  constructor(@Inject(FEE_RATE_TOKEN) feeRate: number) {
    this.feeRate = feeRate;
  }

  get rate(): number {
    return this.feeRate;
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
