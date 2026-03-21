import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { ProjectCompletedEvent } from '../../domain/events/project-completed.event';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQConfigService) {}

  publishProjectCreated(event: ProjectCreatedEvent) {
    return this.rabbit.publishEvent('project.created', event.payload);
  }

  publishProjectCompleted(event: ProjectCompletedEvent) {
    return this.rabbit.publishEvent('project.completed', event.payload);
  }

  publishMilestoneCreated(event: MilestoneCreatedEvent) {
    return this.rabbit.publishEvent('milestone.created', event.payload);
  }

  publishMilestoneUpdated(event: MilestoneUpdatedEvent) {
    return this.rabbit.publishEvent('milestone.updated', event.payload);
  }
}
