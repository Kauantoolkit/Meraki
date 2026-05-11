import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { ContractRepository } from '../../infrastructure/repositories/contract.repository';
import { ContractFactory } from '../../domain/factories/contract.factory';
import { ContractType } from '../../domain/enums/contract-type.enum';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCompletedEvent } from '../../domain/events/project-completed.event';
import { MilestoneStatus } from '../../domain/enums/milestone-status.enum';

@Injectable()
export class CompleteProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly milestoneRepo: MilestoneRepository,
    private readonly contractRepo: ContractRepository,
    private readonly contractFactory: ContractFactory,
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

    const contract = this.contractFactory.create({
      projectId: project.id,
      type: ContractType.PROJECT,
      title: `Contrato final do projeto "${project.title}"`,
      content: `O projeto "${project.title}" foi concluído com ${milestones.length} milestones aprovadas. Valor total: R$ ${project.budget.toFixed(2)}. Contrato final do projeto registrado.`,
    });
    await this.contractRepo.save(contract);

    await this.events.publishProjectCompleted(
      new ProjectCompletedEvent({
        projectId: project.id,
        specialistId: project.specialistId,
        companyId: project.companyId,
      }),
    );
  }
}
