import { ProjectHistory } from '../entities/project-history.entity';

export interface IHistoryRepository {
  save(history: Partial<ProjectHistory>): Promise<ProjectHistory>;
  findByProject(projectId: string): Promise<ProjectHistory[]>;
}
