import { Password } from '../../../src/domain/value-objects/password.value-object';
import { InvalidPasswordException } from '../../../src/domain/exceptions/domain.exception';

describe('Password Value Object', () => {
  it('deve criar senha valida', () => {
    const pwd = new Password('Abcdefg1');
    expect(pwd.value).toBe('Abcdefg1');
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    expect(() => new Password('Ab1')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha vazia', () => {
    expect(() => new Password('')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha sem letra maiuscula', () => {
    expect(() => new Password('abcdefg1')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha sem letra minuscula', () => {
    expect(() => new Password('ABCDEFG1')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha sem numero', () => {
    expect(() => new Password('Abcdefgh')).toThrow(InvalidPasswordException);
  });

  it('deve aceitar senha forte', () => {
    const pwd = new Password('MinhaSenha123');
    expect(pwd.value).toBe('MinhaSenha123');
  });
});
