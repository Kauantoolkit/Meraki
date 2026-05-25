import { BaseEvent } from './base.event';

export class BidRejectedEvent extends BaseEvent {
  readonly payload: { bidId: string; projectId: string; specialistId: string };

  constructor(payload: BidRejectedEvent['payload']) {
    super('bid.rejected');
    this.payload = payload;
  }
}
