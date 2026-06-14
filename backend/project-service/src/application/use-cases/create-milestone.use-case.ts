import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneFactory } from '../../domain/factories/milestone.factory';
import { IMilestoneRepository, MILESTONE_REPOSITORY } from '../../domain/repositories/milestone.repository.interface';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { ProjectStatus } from '../../domain/enums/project-status.enum';

@Injectable()
export class CreateMilestoneUseCase {
  constructor(
    private readonly factory: MilestoneFactory,
    @Inject(MILESTONE_REPOSITORY) private readonly milestoneRepo: IMilestoneRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
  ) {}

  async execute(projectId: string, dto: CreateMilestoneDto, companyId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.companyId !== companyId) throw new ForbiddenException('Não autorizado');
    if (project.status === ProjectStatus.CANCELLED || project.status === ProjectStatus.COMPLETED) {
      throw new ForbiddenException('Não é possível adicionar milestones a este projeto');
    }

    const existing = await this.milestoneRepo.findByProject(projectId);
    const nextOrder = existing.length + 1;

    const milestone = this.factory.create(dto, projectId, nextOrder);
    const saved = await this.milestoneRepo.save(milestone);

    const event = new MilestoneCreatedEvent({
      milestoneId: saved.id,
      projectId: saved.projectId,
      amount: saved.amount,
      order: saved.order,
    });

    await this.events.publishMilestoneCreated(event);
    this.emitter.emit('milestone.created', event);

    return saved;
  }
}
