import { InvalidCPFException } from '../exceptions/domain.exception';

export class CPF {
  private readonly _value: string;

  constructor(cpf: string) {
    const cleaned = CPF.clean(cpf);
    if (!CPF.isValid(cleaned)) {
      throw new InvalidCPFException(cpf);
    }
    this._value = cleaned;
  }

  private static clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  static isValid(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) return false;

    return true;
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    return this._value.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4',
    );
  }

  equals(other: CPF): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
