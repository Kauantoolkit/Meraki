import { DomainException } from '../exceptions/domain.exception';

export class Money {
  private readonly _amount: number;

  constructor(amount: number | string) {
    const parsed = Number(amount);
    if (isNaN(parsed) || parsed < 0) {
      throw new DomainException('Valor monetário não pode ser negativo');
    }
    this._amount = Number(parsed.toFixed(2));
  }

  getAmount(): number {
    return this._amount;
  }

  add(other: Money): Money {
    return new Money(this._amount + other._amount);
  }

  subtract(other: Money): Money {
    return new Money(this._amount - other._amount);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isGreaterThan(other: Money): boolean {
    return this._amount > other._amount;
  }

  toString(): string {
    return this._amount.toFixed(2);
  }
}
