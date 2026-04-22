import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — Rating
 * Encapsula e valida a avaliação de um especialista (0-5).
 * Comparado por valor, sem identidade própria.
 */
export class Rating {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 5) {
      throw new DomainException('Rating deve estar entre 0 e 5');
    }
    this.value = Number(value.toFixed(2));
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Rating): boolean {
    return this.value === other.value;
  }

  static average(ratings: number[]): Rating {
    if (!ratings.length) return new Rating(0);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return new Rating(Math.min(5, Math.max(0, avg)));
  }
}
