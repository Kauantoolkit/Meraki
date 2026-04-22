import { CNPJ } from '../../../src/domain/value-objects/cnpj.value-object';
import { InvalidCNPJException } from '../../../src/domain/exceptions/domain.exception';

describe('CNPJ Value Object', () => {
  // CNPJ valido conhecido para teste
  const VALID_CNPJ = '11222333000181';
  const VALID_CNPJ_FORMATTED = '11.222.333/0001-81';

  it('deve criar CNPJ valido', () => {
    const cnpj = new CNPJ(VALID_CNPJ);
    expect(cnpj.value).toBe(VALID_CNPJ);
  });

  it('deve aceitar CNPJ com formatacao', () => {
    const cnpj = new CNPJ(VALID_CNPJ_FORMATTED);
    expect(cnpj.value).toBe(VALID_CNPJ);
  });

  it('deve formatar CNPJ corretamente', () => {
    const cnpj = new CNPJ(VALID_CNPJ);
    expect(cnpj.formatted).toBe(VALID_CNPJ_FORMATTED);
  });

  it('deve rejeitar CNPJ com todos os digitos iguais', () => {
    expect(() => new CNPJ('11111111111111')).toThrow(InvalidCNPJException);
  });

  it('deve rejeitar CNPJ com tamanho incorreto', () => {
    expect(() => new CNPJ('1234567')).toThrow(InvalidCNPJException);
  });

  it('deve rejeitar CNPJ com digito verificador invalido', () => {
    expect(() => new CNPJ('11222333000100')).toThrow(InvalidCNPJException);
  });

  it('deve comparar CNPJs por valor', () => {
    const a = new CNPJ(VALID_CNPJ);
    const b = new CNPJ(VALID_CNPJ_FORMATTED);
    expect(a.equals(b)).toBe(true);
  });

  it('toString retorna o valor limpo', () => {
    const cnpj = new CNPJ(VALID_CNPJ);
    expect(cnpj.toString()).toBe(VALID_CNPJ);
  });

  it('isValid retorna true para CNPJ valido', () => {
    expect(CNPJ.isValid(VALID_CNPJ)).toBe(true);
  });

  it('isValid retorna false para CNPJ invalido', () => {
    expect(CNPJ.isValid('12345678000100')).toBe(false);
  });
});
