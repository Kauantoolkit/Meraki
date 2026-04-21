import { DomainException } from './domain.exception';

export class InvalidPaymentAmountError extends DomainException {
  constructor() {
    super('Valor do pagamento deve ser maior que zero (RN06)');
  }
}
