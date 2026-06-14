import { Injectable, Inject } from '@nestjs/common';
import { IMilestoneRepository, MILESTONE_REPOSITORY } from '../../domain/repositories/milestone.repository.interface';

@Injectable()
export class GetMilestonesByProjectUseCase {
  constructor(
    @Inject(MILESTONE_REPOSITORY) private readonly milestoneRepo: IMilestoneRepository,
  ) {}

  execute(projectId: string) {
    return this.milestoneRepo.findByProject(projectId);
  }
}
