import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { FindProjectsFilter } from '../../domain/repositories/project.repository.interface';

@Injectable()
export class GetProjectsUseCase {
  constructor(private readonly projectRepo: ProjectRepository) {}

  execute(filter: FindProjectsFilter) {
    return this.projectRepo.findAll(filter);
  }
}
