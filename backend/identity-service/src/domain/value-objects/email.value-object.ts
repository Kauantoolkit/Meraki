import { InvalidEmailException } from '../exceptions/domain.exception';

export class Email {
  private readonly _value: string;

  constructor(email: string) {
    if (!Email.isValid(email)) {
      throw new InvalidEmailException(email);
    }
    this._value = email.toLowerCase().trim();
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
