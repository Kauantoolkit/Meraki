import { InvalidPasswordException } from '../exceptions/domain.exception';

export class Password {
  private readonly _value: string;

  private static readonly MIN_LENGTH = 8;

  constructor(password: string) {
    Password.validate(password);
    this._value = password;
  }

  private static validate(password: string): void {
    if (!password || password.length < Password.MIN_LENGTH) {
      throw new InvalidPasswordException(
        `deve ter pelo menos ${Password.MIN_LENGTH} caracteres`,
      );
    }
    if (!/[A-Z]/.test(password)) {
      throw new InvalidPasswordException(
        'deve conter pelo menos uma letra maiúscula',
      );
    }
    if (!/[a-z]/.test(password)) {
      throw new InvalidPasswordException(
        'deve conter pelo menos uma letra minúscula',
      );
    }
    if (!/[0-9]/.test(password)) {
      throw new InvalidPasswordException(
        'deve conter pelo menos um número',
      );
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }
}
