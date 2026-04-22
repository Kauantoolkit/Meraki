import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';

@Injectable()
export class CancelProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async execute(id: string, companyId: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.companyId !== companyId) throw new ForbiddenException('Não autorizado');

    project.cancel(); // invariante no domain
    return this.projectRepo.save(project);
  }
}
