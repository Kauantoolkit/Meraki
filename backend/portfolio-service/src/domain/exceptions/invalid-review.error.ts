import { DomainException } from './domain.exception';

export class InvalidReviewError extends DomainException {
  constructor(reason: string) {
    super(`Review inválida: ${reason}`);
    this.name = 'InvalidReviewError';
  }
}
