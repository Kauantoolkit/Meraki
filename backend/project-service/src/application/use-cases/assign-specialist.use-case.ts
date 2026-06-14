import { Injectable, Logger, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';

/** Consumido via evento bid.accepted do RabbitMQ */
@Injectable()
export class AssignSpecialistUseCase {
  private readonly logger = new Logger(AssignSpecialistUseCase.name);

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(projectId: string, specialistId: string, bidId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      this.logger.warn(`Projeto ${projectId} não encontrado ao processar bid.accepted`);
      return;
    }

    project.assignSpecialist(specialistId, bidId); // invariante no domain
    await this.projectRepo.save(project);
    this.logger.log(`Especialista ${specialistId} atribuído ao projeto ${projectId}`);
  }
}
