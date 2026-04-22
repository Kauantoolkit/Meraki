import { DomainException } from './domain.exception';

export class BidNotPendingError extends DomainException {
  constructor(action: string) {
    super(`Só é possível ${action} propostas PENDING`);
  }
}
