import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY, FindProjectsFilter } from '../../domain/repositories/project.repository.interface';

@Injectable()
export class GetProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  execute(filter: FindProjectsFilter) {
    return this.projectRepo.findAll(filter);
  }
}
