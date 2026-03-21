import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — Deadline
 * Encapsula e valida o prazo de um projeto.
 * Garante que o prazo seja sempre uma data futura (RN01).
 */
export class Deadline {
  private readonly value: Date;

  constructor(date: Date | string) {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new DomainException('Deadline inválido');
    }
    if (parsed <= new Date()) {
      throw new DomainException('Deadline deve ser uma data futura (RN01)');
    }
    this.value = parsed;
  }

  getValue(): Date {
    return this.value;
  }

  equals(other: Deadline): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isBefore(date: Date): boolean {
    return this.value < date;
  }
}
