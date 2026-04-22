import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — Budget
 * Encapsula e valida o orçamento de um projeto.
 * Comparado por valor, sem identidade própria.
 */
export class Budget {
  private readonly value: number;

  constructor(amount: number) {
    if (!amount || amount <= 0) {
      throw new DomainException('Budget deve ser maior que zero (RN01)');
    }
    this.value = Number(amount.toFixed(2));
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Budget): boolean {
    return this.value === other.value;
  }
}
