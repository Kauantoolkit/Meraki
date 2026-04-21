import { Rating } from '../../../src/domain/value-objects/rating.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('Rating Value Object', () => {
  it('deve criar rating valido', () => {
    const r = new Rating(4.5);
    expect(r.getValue()).toBe(4.5);
  });

  it('deve arredondar para 2 casas decimais', () => {
    const r = new Rating(3.456);
    expect(r.getValue()).toBe(3.46);
  });

  it('deve aceitar 0', () => {
    const r = new Rating(0);
    expect(r.getValue()).toBe(0);
  });

  it('deve aceitar 5', () => {
    const r = new Rating(5);
    expect(r.getValue()).toBe(5);
  });

  it('deve rejeitar valor negativo', () => {
    expect(() => new Rating(-1)).toThrow(DomainException);
  });

  it('deve rejeitar valor maior que 5', () => {
    expect(() => new Rating(5.1)).toThrow(DomainException);
  });

  it('deve comparar ratings por valor', () => {
    const a = new Rating(4);
    const b = new Rating(4);
    expect(a.equals(b)).toBe(true);
  });

  describe('average()', () => {
    it('deve calcular media corretamente', () => {
      const avg = Rating.average([4, 5, 3]);
      expect(avg.getValue()).toBe(4);
    });

    it('deve retornar 0 para array vazio', () => {
      const avg = Rating.average([]);
      expect(avg.getValue()).toBe(0);
    });

    it('deve limitar ao maximo de 5', () => {
      const avg = Rating.average([5, 5, 5]);
      expect(avg.getValue()).toBeLessThanOrEqual(5);
    });
  });
});
