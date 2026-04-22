import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCompletedEvent } from '../../domain/events/project-completed.event';
import { MilestoneStatus } from '../../domain/enums/milestone-status.enum';

@Injectable()
export class CompleteProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly milestoneRepo: MilestoneRepository,
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
