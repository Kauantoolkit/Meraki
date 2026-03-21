import { Injectable } from '@nestjs/common';
import { ProjectFactory } from '../../domain/factories/project.factory';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly factory: ProjectFactory,
    private readonly projectRepo: ProjectRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: CreateProjectDto, companyId: string): Promise<Project> {
    const project = this.factory.create({ ...dto, companyId });
    const saved = await this.projectRepo.save(project);

    await this.events.publishProjectCreated(
      new ProjectCreatedEvent({
        projectId: saved.id,
        title: saved.title,
        budget: saved.budget,
        companyId: saved.companyId,
      }),
    );

    return saved;
  }
}
