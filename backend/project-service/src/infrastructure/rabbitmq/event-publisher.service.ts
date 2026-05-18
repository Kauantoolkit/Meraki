import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { ProjectRoutingKey } from '@shared/contracts/events/project.events';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { ProjectCompletedEvent } from '../../domain/events/project-completed.event';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQService) {}

  publishProjectCreated(event: ProjectCreatedEvent) {
    return this.rabbit.publishEvent(ProjectRoutingKey.PROJECT_CREATED, event.payload);
  }

  publishProjectCompleted(event: ProjectCompletedEvent) {
    return this.rabbit.publishEvent(ProjectRoutingKey.PROJECT_COMPLETED, event.payload);
  }

  publishMilestoneCreated(event: MilestoneCreatedEvent) {
    return this.rabbit.publishEvent(ProjectRoutingKey.MILESTONE_CREATED, event.payload);
  }

  publishMilestoneUpdated(event: MilestoneUpdatedEvent) {
    return this.rabbit.publishEvent(ProjectRoutingKey.MILESTONE_UPDATED, event.payload);
  }
}
