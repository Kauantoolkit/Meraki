import { Injectable } from '@nestjs/common';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';

@Injectable()
export class GetMilestonesByProjectUseCase {
  constructor(private readonly milestoneRepo: MilestoneRepository) {}

  execute(projectId: string) {
    return this.milestoneRepo.findByProject(projectId);
  }
}
