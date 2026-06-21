import { Injectable, Logger, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { IMilestoneRepository, MILESTONE_REPOSITORY } from '../../domain/repositories/milestone.repository.interface';

/** Consumido via evento bid.accepted do RabbitMQ */
@Injectable()
export class AssignSpecialistUseCase {
  private readonly logger = new Logger(AssignSpecialistUseCase.name);

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
    @Inject(MILESTONE_REPOSITORY) private readonly milestoneRepo: IMilestoneRepository,
  ) {}

  async execute(
    projectId: string,
    specialistId: string,
    bidId: string,
    proposedBudget?: number,
    milestoneProposals?: Array<{ milestoneId: string; proposedAmount: number }>,
  ) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      this.logger.warn(`Projeto ${projectId} não encontrado ao processar bid.accepted`);
      return;
    }

    project.assignSpecialist(specialistId, bidId); // invariante no domain

    // Atualiza o budget do projeto com o valor da proposta aceita
    if (proposedBudget != null && proposedBudget > 0) {
      project.budget = proposedBudget;
    }

    await this.projectRepo.save(project);

    // Atualiza o amount de cada milestone com o valor proposto pelo especialista
    if (milestoneProposals?.length) {
      const milestones = await this.milestoneRepo.findByProject(projectId);
      for (const mp of milestoneProposals) {
        const ms = milestones.find(m => m.id === mp.milestoneId);
        if (ms) {
          ms.amount = Number(mp.proposedAmount);
          await this.milestoneRepo.save(ms);
        }
      }
      this.logger.log(`Milestone amounts atualizados com valores da proposta aceita`);
    }

    this.logger.log(`Especialista ${specialistId} atribuído ao projeto ${projectId} (budget=${proposedBudget ?? project.budget})`);
  }
}
