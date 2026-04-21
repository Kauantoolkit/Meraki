import { DomainException } from '../exceptions/domain.exception';

export class Money {
  readonly amount: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new DomainException('Valor monetário não pode ser negativo');
    }
    this.amount = Number(amount.toFixed(2));
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  toString(): string {
    return this.amount.toFixed(2);
  }
}
