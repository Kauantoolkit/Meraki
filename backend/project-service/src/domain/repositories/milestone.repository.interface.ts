import { Milestone } from '../entities/milestone.entity';

export const MILESTONE_REPOSITORY = 'MILESTONE_REPOSITORY';

export interface IMilestoneRepository {
  findById(id: string): Promise<Milestone | null>;
  findByProject(projectId: string): Promise<Milestone[]>;
  save(milestone: Milestone): Promise<Milestone>;
  saveMany(milestones: Milestone[]): Promise<Milestone[]>;
  delete(id: string): Promise<void>;
}
