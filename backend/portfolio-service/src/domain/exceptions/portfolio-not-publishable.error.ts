import { DomainException } from './domain.exception';

export class PortfolioNotPublishableError extends DomainException {
  constructor() {
    super('Portfolio precisa de título, descrição e specialistId para ser publicado');
    this.name = 'PortfolioNotPublishableError';
  }
}
