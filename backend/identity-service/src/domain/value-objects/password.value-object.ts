import * as bcrypt from 'bcrypt';
import { InvalidPasswordException } from '../exceptions/domain.exception';

/**
 * Password Value Object — encapsula um plaintext validado.
 * Não expõe o valor bruto; só permite (a) gerar hash bcrypt e (b) comparar contra hash existente.
 */
export class Password {
  private _value: string | null;

  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 72;
  private static readonly DEFAULT_SALT_ROUNDS = 10;

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
    if (password.length > Password.MAX_LENGTH) {
      throw new InvalidPasswordException(
        `deve ter no máximo ${Password.MAX_LENGTH} caracteres`,
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

  async hash(saltRounds: number = Password.DEFAULT_SALT_ROUNDS): Promise<string> {
    if (this._value === null) {
      throw new InvalidPasswordException('senha já foi consumida');
    }
    const hashed = await bcrypt.hash(this._value, saltRounds);
    this._value = null;
    return hashed;
  }

  static async matches(plaintext: string, hash: string): Promise<boolean> {
    if (!plaintext || !hash) return false;
    return bcrypt.compare(plaintext, hash);
  }
}
