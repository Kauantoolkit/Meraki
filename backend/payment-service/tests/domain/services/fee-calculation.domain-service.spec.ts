import { FeeCalculationDomainService } from '../../../src/domain/services/fee-calculation.domain-service';
import { InvalidPaymentAmountError } from '../../../src/domain/exceptions/invalid-payment-amount.error';

describe('FeeCalculationDomainService — RN06', () => {
  let service: FeeCalculationDomainService;

  beforeEach(() => {
    service = new FeeCalculationDomainService(0.10);
  });

  it('deve retornar a taxa configurada', () => {
    expect(service.rate).toBe(0.10);
  });

  it('deve calcular taxa e valor do especialista corretamente', () => {
    const result = service.calculate(10000);
    expect(result.platformFee).toBe(1000);
    expect(result.specialistAmount).toBe(9000);
  });

  it('deve manter precisao decimal', () => {
    const result = service.calculate(1333.33);
    expect(result.platformFee).toBe(133.33);
    expect(result.specialistAmount).toBe(1200);
  });

  it('deve rejeitar valor zero', () => {
    expect(() => service.calculate(0)).toThrow(InvalidPaymentAmountError);
  });

  it('deve rejeitar valor negativo', () => {
    expect(() => service.calculate(-500)).toThrow(InvalidPaymentAmountError);
  });

  it('deve funcionar com taxa de 20%', () => {
    const service20 = new FeeCalculationDomainService(0.20);
    const result = service20.calculate(5000);
    expect(result.platformFee).toBe(1000);
    expect(result.specialistAmount).toBe(4000);
  });
});
