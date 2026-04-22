import { BaseEvent } from './base.event';

export class PortfolioPublishedEvent extends BaseEvent {
  readonly payload: { portfolioId: string; specialistId: string };

  constructor(payload: PortfolioPublishedEvent['payload']) {
    super('portfolio.published');
    this.payload = payload;
  }
}
