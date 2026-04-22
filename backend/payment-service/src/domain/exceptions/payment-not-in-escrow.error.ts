import { DomainException } from './domain.exception';

export class PaymentNotInEscrowError extends DomainException {
  constructor() {
    super('Só é possível liberar pagamentos em ESCROW_HELD (RN06)');
  }
}
