import { DomainException } from './domain.exception';

export class BidAlreadyAcceptedError extends DomainException {
  constructor() {
    super('Este projeto já possui um especialista selecionado (RN03)');
    this.name = 'BidAlreadyAcceptedError';
  }
}
