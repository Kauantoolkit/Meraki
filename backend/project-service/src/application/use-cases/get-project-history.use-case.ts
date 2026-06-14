import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProjectHistoryRepository, PROJECT_HISTORY_REPOSITORY } from '../../domain/repositories/project-history.repository.interface';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { ProjectHistory } from '../../domain/entities/project-history.entity';

@Injectable()
export class GetProjectHistoryUseCase {
  constructor(
    @Inject(PROJECT_HISTORY_REPOSITORY) private readonly historyRepo: IProjectHistoryRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectHistory[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return this.historyRepo.findByProject(projectId);
  }
}
