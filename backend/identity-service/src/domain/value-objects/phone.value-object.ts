import { InvalidPhoneException } from '../exceptions/domain.exception';

export class Phone {
  private readonly _value: string;

  constructor(phone: string) {
    const cleaned = Phone.clean(phone);
    if (!Phone.isValid(cleaned)) {
      throw new InvalidPhoneException(phone);
    }
    this._value = cleaned;
  }

  private static clean(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  static isValid(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Aceita telefones brasileiros: 10 ou 11 dígitos (com DDD)
    return cleaned.length === 10 || cleaned.length === 11;
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    if (this._value.length === 11) {
      return this._value.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3',
      );
    }
    return this._value.replace(
      /(\d{2})(\d{4})(\d{4})/,
      '($1) $2-$3',
    );
  }

  equals(other: Phone): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
