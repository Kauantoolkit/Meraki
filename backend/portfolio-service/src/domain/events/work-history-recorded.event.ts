import { BaseEvent } from './base.event';

export class WorkHistoryRecordedEvent extends BaseEvent {
  readonly payload: { workHistoryId: string; specialistId: string; projectId: string };

  constructor(payload: WorkHistoryRecordedEvent['payload']) {
    super('work-history.recorded');
    this.payload = payload;
  }
}
