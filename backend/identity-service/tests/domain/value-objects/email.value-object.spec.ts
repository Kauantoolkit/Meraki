import { Email } from '../../../src/domain/value-objects/email.value-object';
import { InvalidEmailException } from '../../../src/domain/exceptions/domain.exception';

describe('Email Value Object', () => {
  it('deve criar email valido', () => {
    const email = new Email('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('deve converter para lowercase', () => {
    const email = new Email('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('deve rejeitar email com espacos (validacao antes do trim)', () => {
    expect(() => new Email('  user@example.com  ')).toThrow(InvalidEmailException);
  });

  it('deve rejeitar email sem @', () => {
    expect(() => new Email('invalido')).toThrow(InvalidEmailException);
  });

  it('deve rejeitar email sem dominio', () => {
    expect(() => new Email('user@')).toThrow(InvalidEmailException);
  });

  it('deve rejeitar email vazio', () => {
    expect(() => new Email('')).toThrow(InvalidEmailException);
  });

  it('deve comparar emails por valor', () => {
    const a = new Email('a@b.com');
    const b = new Email('A@B.COM');
    expect(a.equals(b)).toBe(true);
  });

  it('toString retorna o valor', () => {
    const email = new Email('user@test.com');
    expect(email.toString()).toBe('user@test.com');
  });

  it('isValid retorna true para email valido', () => {
    expect(Email.isValid('user@test.com')).toBe(true);
  });

  it('isValid retorna false para email invalido', () => {
    expect(Email.isValid('invalido')).toBe(false);
  });
});
