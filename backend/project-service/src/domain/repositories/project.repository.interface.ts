import { Project } from '../entities/project.entity';
import { ProjectStatus } from '../enums/project-status.enum';

export interface FindProjectsFilter {
  status?: ProjectStatus;
  companyId?: string;
  specialistId?: string;
  page?: number;
  limit?: number;
}

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(filter: FindProjectsFilter): Promise<{ data: Project[]; total: number }>;
  save(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
}
