import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — ProposedValue
 * Encapsula e valida o valor proposto em uma bid.
 * Comparado por atributos, sem identidade própria.
 */
export class ProposedValue {
  private readonly value: number;

  constructor(amount: number) {
    if (!amount || amount <= 0) {
      throw new DomainException('Valor proposto deve ser maior que zero');
    }
    this.value = Number(amount.toFixed(2));
  }

  getValue(): number {
    return this.value;
  }

  equals(other: ProposedValue): boolean {
    return this.value === other.value;
  }
}
