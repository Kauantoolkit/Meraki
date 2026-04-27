import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectHistory } from '../../domain/entities/project-history.entity';
import { IProjectHistoryRepository } from '../../domain/repositories/project-history.repository.interface';

@Injectable()
export class ProjectHistoryRepository implements IProjectHistoryRepository {
  constructor(
    @InjectRepository(ProjectHistory)
    private readonly repo: Repository<ProjectHistory>,
  ) {}

  save(entry: Omit<ProjectHistory, 'id' | 'createdAt'>): Promise<ProjectHistory> {
    return this.repo.save(entry);
  }

  findByProject(projectId: string): Promise<ProjectHistory[]> {
    return this.repo.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }
}
