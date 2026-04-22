import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';

@Injectable()
export class GetProjectByIdUseCase {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async execute(id: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project;
  }
}
