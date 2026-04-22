import { BaseEvent } from './base.event';

export class MilestoneValidatedEvent extends BaseEvent {
  readonly payload: {
    milestoneId: string;
    projectId: string;
    amount: number;
    specialistId: string;
  };

  constructor(payload: MilestoneValidatedEvent['payload']) {
    super();
    this.payload = payload;
  }
}
