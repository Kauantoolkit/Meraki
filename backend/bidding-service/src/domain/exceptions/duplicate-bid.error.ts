import { DomainException } from './domain.exception';

export class DuplicateBidError extends DomainException {
  constructor() {
    super('Especialista já possui uma proposta ativa neste projeto (RN02)');
  }
}
