import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { IMilestoneRepository, MILESTONE_REPOSITORY } from '../../domain/repositories/milestone.repository.interface';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCompletedEvent } from '../../domain/events/project-completed.event';
import { MilestoneStatus } from '../../domain/enums/milestone-status.enum';

@Injectable()
export class CompleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
    @Inject(MILESTONE_REPOSITORY) private readonly milestoneRepo: IMilestoneRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(id: string, companyId: string): Promise<void> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.companyId !== companyId) throw new ForbiddenException('Não autorizado');

    const milestones = await this.milestoneRepo.findByProject(id);
    if (milestones.length === 0) {
      throw new BadRequestException('Projeto não possui milestones');
    }

    const allApproved = milestones.every((m) => m.status === MilestoneStatus.APPROVED);
    if (!allApproved) {
      throw new BadRequestException('Todas as milestones precisam estar APPROVED antes de concluir o projeto');
    }

    project.complete();
    await this.projectRepo.save(project);

    await this.events.publishProjectCompleted(
      new ProjectCompletedEvent({
        projectId: project.id,
        specialistId: project.specialistId,
        companyId: project.companyId,
      }),
    );
  }
}
