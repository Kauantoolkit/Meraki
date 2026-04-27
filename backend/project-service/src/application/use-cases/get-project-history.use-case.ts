import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectHistoryRepository } from '../../infrastructure/repositories/project-history.repository';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { ProjectHistory } from '../../domain/entities/project-history.entity';

@Injectable()
export class GetProjectHistoryUseCase {
  constructor(
    private readonly historyRepo: ProjectHistoryRepository,
    private readonly projectRepo: ProjectRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectHistory[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return this.historyRepo.findByProject(projectId);
  }
}
