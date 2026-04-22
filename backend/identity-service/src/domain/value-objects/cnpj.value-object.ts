import { InvalidCNPJException } from '../exceptions/domain.exception';

export class CNPJ {
  private readonly _value: string;

  constructor(cnpj: string) {
    const cleaned = CNPJ.clean(cnpj);
    if (!CNPJ.isValid(cleaned)) {
      throw new InvalidCNPJException(cnpj);
    }
    this._value = cleaned;
  }

  private static clean(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  static isValid(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cleaned.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cleaned.charAt(13))) return false;

    return true;
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    return this._value.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }

  equals(other: CNPJ): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
