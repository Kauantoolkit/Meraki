import { BaseEvent } from './base.event';

export class ProjectCompletedEvent extends BaseEvent {
  readonly payload: {
    projectId: string;
    specialistId: string;
    companyId: string;
  };

  constructor(payload: ProjectCompletedEvent['payload']) {
    super('project.completed');
    this.payload = payload;
  }
}
