import { DomainException } from '../exceptions/domain.exception';

export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new DomainException('Valor monetário não pode ser negativo');
    }
    this._amount = Number(amount.toFixed(2));
  }

  get amount(): number {
    return this._amount;
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
