import { DomainException } from './domain.exception';

export class InvalidDeliveryTransitionError extends DomainException {
  constructor(action: string, currentStatus: string) {
    super(`Não é possível ${action} uma entrega com status ${currentStatus}.`);
  }
}
