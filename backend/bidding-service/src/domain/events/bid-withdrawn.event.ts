import { BaseEvent } from './base.event';

export class BidWithdrawnEvent extends BaseEvent {
  readonly payload: { bidId: string; projectId: string; specialistId: string };

  constructor(payload: BidWithdrawnEvent['payload']) {
    super('bid.withdrawn');
    this.payload = payload;
  }
}
