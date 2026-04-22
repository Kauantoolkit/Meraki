import { CPF } from '../../../src/domain/value-objects/cpf.value-object';
import { InvalidCPFException } from '../../../src/domain/exceptions/domain.exception';

describe('CPF Value Object', () => {
  // CPFs validos conhecidos para teste
  const VALID_CPF = '52998224725';
  const VALID_CPF_FORMATTED = '529.982.247-25';

  it('deve criar CPF valido', () => {
    const cpf = new CPF(VALID_CPF);
    expect(cpf.value).toBe(VALID_CPF);
  });

  it('deve aceitar CPF com formatacao', () => {
    const cpf = new CPF(VALID_CPF_FORMATTED);
    expect(cpf.value).toBe(VALID_CPF);
  });

  it('deve formatar CPF corretamente', () => {
    const cpf = new CPF(VALID_CPF);
    expect(cpf.formatted).toBe(VALID_CPF_FORMATTED);
  });

  it('deve rejeitar CPF com todos os digitos iguais', () => {
    expect(() => new CPF('11111111111')).toThrow(InvalidCPFException);
    expect(() => new CPF('00000000000')).toThrow(InvalidCPFException);
  });

  it('deve rejeitar CPF com tamanho incorreto', () => {
    expect(() => new CPF('1234567')).toThrow(InvalidCPFException);
  });

  it('deve rejeitar CPF com digito verificador invalido', () => {
    expect(() => new CPF('52998224720')).toThrow(InvalidCPFException);
  });

  it('deve comparar CPFs por valor', () => {
    const a = new CPF(VALID_CPF);
    const b = new CPF(VALID_CPF_FORMATTED);
    expect(a.equals(b)).toBe(true);
  });

  it('toString retorna o valor limpo', () => {
    const cpf = new CPF(VALID_CPF);
    expect(cpf.toString()).toBe(VALID_CPF);
  });

  it('isValid retorna true para CPF valido', () => {
    expect(CPF.isValid(VALID_CPF)).toBe(true);
  });

  it('isValid retorna false para CPF invalido', () => {
    expect(CPF.isValid('12345678900')).toBe(false);
  });
});
