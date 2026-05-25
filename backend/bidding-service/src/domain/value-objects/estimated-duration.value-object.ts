import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — EstimatedDuration
 * Encapsula e valida o prazo estimado de uma proposta (em dias inteiros).
 * Comparado por atributos, sem identidade própria.
 */
export class EstimatedDuration {
  static readonly MIN_DAYS = 1;
  static readonly MAX_DAYS = 3650; // 10 anos

  private readonly value: number;

  constructor(days: number) {
    if (!Number.isInteger(days) || days < EstimatedDuration.MIN_DAYS) {
      throw new DomainException(
        `Duração estimada deve ser um número inteiro de pelo menos ${EstimatedDuration.MIN_DAYS} dia`,
      );
    }
    if (days > EstimatedDuration.MAX_DAYS) {
      throw new DomainException(
        `Duração estimada não pode ultrapassar ${EstimatedDuration.MAX_DAYS} dias`,
      );
    }
    this.value = days;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: EstimatedDuration): boolean {
    return this.value === other.value;
  }
}
