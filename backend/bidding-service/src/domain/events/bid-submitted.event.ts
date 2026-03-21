import { BaseEvent } from './base.event';

export class BidSubmittedEvent extends BaseEvent {
  readonly payload: { bidId: string; projectId: string; specialistId: string };

  constructor(payload: BidSubmittedEvent['payload']) {
    super('bid.submitted');
    this.payload = payload;
  }
}
