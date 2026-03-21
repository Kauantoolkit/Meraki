import { BaseEvent } from './base.event';

export class MilestoneUpdatedEvent extends BaseEvent {
  readonly payload: {
    milestoneId: string;
    projectId: string;
    status: string;
  };

  constructor(payload: MilestoneUpdatedEvent['payload']) {
    super('milestone.updated');
    this.payload = payload;
  }
}
