import { BaseEvent } from './base.event';

export class ProjectCreatedEvent extends BaseEvent {
  readonly payload: {
    projectId: string;
    title: string;
    budget: number;
    companyId: string;
  };

  constructor(payload: ProjectCreatedEvent['payload']) {
    super('project.created');
    this.payload = payload;
  }
}
