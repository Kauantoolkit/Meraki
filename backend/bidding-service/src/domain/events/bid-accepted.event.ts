import { BaseEvent } from './base.event';

export class BidAcceptedEvent extends BaseEvent {
  readonly payload: {
    bidId: string;
    projectId: string;
    specialistId: string;
    proposedBudget: number;
    milestoneProposals?: Array<{ milestoneId: string; proposedAmount: number }>;
  };

  constructor(payload: BidAcceptedEvent['payload']) {
    super('bid.accepted');
    this.payload = payload;
  }
}
