import { Password } from '../../../src/domain/value-objects/password.value-object';
import { InvalidPasswordException } from '../../../src/domain/exceptions/domain.exception';

describe('Password Value Object', () => {
  it('deve criar senha valida sem expor o plaintext', () => {
    const pwd = new Password('Abcdefg1');
    expect(pwd).toBeInstanceOf(Password);
    // não há getter público de plaintext (SEC-08)
    expect((pwd as unknown as { value?: string }).value).toBeUndefined();
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    expect(() => new Password('Ab1')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha vazia', () => {
    expect(() => new Password('')).toThrow(InvalidPasswordException);
  });

  it('deve rejeitar senha com mais de 72 caracteres (limite bcrypt)', () => {
    const longPassword = 'A1' + 'a'.repeat(71);
    expect(() => new Password(longPassword)).toThrow(InvalidPasswordException);
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

  it('deve gerar hash bcrypt e invalidar o plaintext após uso', async () => {
    const pwd = new Password('MinhaSenha123');
    const hash = await pwd.hash();

    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toContain('MinhaSenha123');

    // segunda chamada deve falhar — plaintext já foi consumido
    await expect(pwd.hash()).rejects.toThrow(InvalidPasswordException);
  });

  it('deve validar plaintext correto contra hash via Password.matches', async () => {
    const pwd = new Password('OutraSenha456');
    const hash = await pwd.hash();

    await expect(Password.matches('OutraSenha456', hash)).resolves.toBe(true);
    await expect(Password.matches('senhaErrada1', hash)).resolves.toBe(false);
    await expect(Password.matches('', hash)).resolves.toBe(false);
  });
});
