import { ProjectHistory } from '../entities/project-history.entity';

export const PROJECT_HISTORY_REPOSITORY = 'PROJECT_HISTORY_REPOSITORY';

export interface IProjectHistoryRepository {
  save(entry: Omit<ProjectHistory, 'id' | 'createdAt'>): Promise<ProjectHistory>;
  findByProject(projectId: string): Promise<ProjectHistory[]>;
}
