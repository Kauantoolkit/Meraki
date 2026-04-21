import { Deadline } from '../../../src/domain/value-objects/deadline.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('Deadline Value Object', () => {
  it('deve criar deadline com data futura', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const deadline = new Deadline(future.toISOString());
    expect(deadline.getValue()).toBeInstanceOf(Date);
  });

  it('deve rejeitar deadline no passado', () => {
    expect(() => new Deadline('2020-01-01')).toThrow(DomainException);
  });

  it('deve rejeitar deadline invalida', () => {
    expect(() => new Deadline('nao-e-uma-data')).toThrow(DomainException);
  });

  it('deve comparar deadlines por valor', () => {
    const date = '2030-06-15T00:00:00.000Z';
    const a = new Deadline(date);
    const b = new Deadline(date);
    expect(a.equals(b)).toBe(true);
  });

  it('deve verificar isBefore corretamente', () => {
    const deadline = new Deadline('2030-06-15');
    expect(deadline.isBefore(new Date('2031-01-01'))).toBe(true);
    expect(deadline.isBefore(new Date('2029-01-01'))).toBe(false);
  });
});
