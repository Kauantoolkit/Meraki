import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectHistory } from '../../domain/entities/project-history.entity';
import { IHistoryRepository } from '../../domain/repositories/i-history.repository';

@Injectable()
export class HistoryRepository implements IHistoryRepository {
  constructor(
    @InjectRepository(ProjectHistory)
    private readonly repo: Repository<ProjectHistory>,
  ) {}

  save(history: Partial<ProjectHistory>): Promise<ProjectHistory> {
    return this.repo.save(this.repo.create(history));
  }

  findByProject(projectId: string): Promise<ProjectHistory[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }
}
