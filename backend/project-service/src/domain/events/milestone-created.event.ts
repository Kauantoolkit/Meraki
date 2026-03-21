import { BaseEvent } from './base.event';

export class MilestoneCreatedEvent extends BaseEvent {
  readonly payload: {
    milestoneId: string;
    projectId: string;
    amount: number;
    order: number;
  };

  constructor(payload: MilestoneCreatedEvent['payload']) {
    super('milestone.created');
    this.payload = payload;
  }
}
