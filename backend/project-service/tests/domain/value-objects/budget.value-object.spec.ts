import { Budget } from '../../../src/domain/value-objects/budget.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('Budget Value Object', () => {
  it('deve criar budget com valor positivo', () => {
    const budget = new Budget(1000);
    expect(budget.getValue()).toBe(1000);
  });

  it('deve arredondar para 2 casas decimais', () => {
    const budget = new Budget(1000.555);
    expect(budget.getValue()).toBe(1000.55);
  });

  it('deve rejeitar budget zero', () => {
    expect(() => new Budget(0)).toThrow(DomainException);
  });

  it('deve rejeitar budget negativo', () => {
    expect(() => new Budget(-100)).toThrow(DomainException);
  });

  it('deve comparar budgets por valor', () => {
    const a = new Budget(500);
    const b = new Budget(500);
    expect(a.equals(b)).toBe(true);
  });

  it('deve retornar false para budgets diferentes', () => {
    const a = new Budget(500);
    const b = new Budget(600);
    expect(a.equals(b)).toBe(false);
  });
});
