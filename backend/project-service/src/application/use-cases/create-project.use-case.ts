import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectFactory } from '../../domain/factories/project.factory';
import { MilestoneFactory } from '../../domain/factories/milestone.factory';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';
import { SkillsCatalogService } from '../../infrastructure/http/skills-catalog.service';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectFactory: ProjectFactory,
    private readonly milestoneFactory: MilestoneFactory,
    private readonly projectRepo: ProjectRepository,
    private readonly milestoneRepo: MilestoneRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
    private readonly skillsCatalog: SkillsCatalogService,
  ) {}

  async execute(dto: CreateProjectDto, companyId: string): Promise<Project> {
    if (dto.requirements && dto.requirements.length > 0) {
      const unknown = await this.skillsCatalog.validateSkills(dto.requirements);
      if (unknown.length > 0) {
        throw new BadRequestException(
          `As seguintes skills não existem no catálogo: ${unknown.join(', ')}. Crie-as antes de publicar o projeto.`,
        );
      }
    }
    const { milestones: milestoneDtos, ...projectData } = dto;

    const project = this.projectFactory.create({ ...projectData, companyId });
    const saved = await this.projectRepo.save(project);

    if (milestoneDtos && milestoneDtos.length > 0) {
      try {
        const milestones = this.milestoneFactory.createBatch(milestoneDtos, saved.id);
        const savedMilestones = await this.milestoneRepo.saveMany(milestones);
        saved.milestones = savedMilestones;

        for (const milestone of savedMilestones) {
          const milestoneEvent = new MilestoneCreatedEvent({
            milestoneId: milestone.id,
            projectId: milestone.projectId,
            amount: milestone.amount,
            order: milestone.order,
          });
          await this.events.publishMilestoneCreated(milestoneEvent);
          this.emitter.emit('milestone.created', milestoneEvent);
        }
      } catch (err) {
        await this.projectRepo.delete(saved.id);
        throw err;
      }
    }

    const projectEvent = new ProjectCreatedEvent({
      projectId: saved.id,
      title: saved.title,
      budget: saved.budget,
      companyId: saved.companyId,
    });

    await this.events.publishProjectCreated(projectEvent);
    this.emitter.emit('project.created', projectEvent);

    return saved;
  }
}
