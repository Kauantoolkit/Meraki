import { Money } from '../../../src/domain/value-objects/money.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('Money Value Object', () => {
  it('deve criar Money com valor positivo', () => {
    const m = new Money(100);
    expect(m.amount).toBe(100);
  });

  it('deve aceitar zero', () => {
    const m = new Money(0);
    expect(m.amount).toBe(0);
  });

  it('deve arredondar para 2 casas decimais', () => {
    const m = new Money(100.555);
    expect(m.amount).toBe(100.56);
  });

  it('deve rejeitar valor negativo', () => {
    expect(() => new Money(-10)).toThrow(DomainException);
  });

  describe('operacoes aritmeticas', () => {
    it('add() deve somar corretamente', () => {
      const result = new Money(100).add(new Money(50));
      expect(result.amount).toBe(150);
    });

    it('subtract() deve subtrair corretamente', () => {
      const result = new Money(100).subtract(new Money(30));
      expect(result.amount).toBe(70);
    });

    it('subtract() deve rejeitar resultado negativo', () => {
      expect(() => new Money(10).subtract(new Money(20))).toThrow(DomainException);
    });

    it('multiply() deve multiplicar corretamente', () => {
      const result = new Money(100).multiply(0.1);
      expect(result.amount).toBe(10);
    });
  });

  describe('comparacoes', () => {
    it('equals() deve comparar por valor', () => {
      expect(new Money(100).equals(new Money(100))).toBe(true);
      expect(new Money(100).equals(new Money(200))).toBe(false);
    });

    it('isZero() deve verificar zero', () => {
      expect(new Money(0).isZero()).toBe(true);
      expect(new Money(1).isZero()).toBe(false);
    });

    it('isGreaterThan() deve comparar corretamente', () => {
      expect(new Money(100).isGreaterThan(new Money(50))).toBe(true);
      expect(new Money(50).isGreaterThan(new Money(100))).toBe(false);
    });
  });

  it('toString() deve formatar com 2 casas', () => {
    expect(new Money(100).toString()).toBe('100.00');
  });
});
