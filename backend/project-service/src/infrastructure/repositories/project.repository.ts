import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../domain/entities/project.entity';
import {
  IProjectRepository,
  FindProjectsFilter,
} from '../../domain/repositories/project.repository.interface';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  findById(id: string): Promise<Project | null> {
    return this.repo.findOne({ where: { id }, relations: ['milestones'] });
  }

  async findAll(filter: FindProjectsFilter): Promise<{ data: Project[]; total: number }> {
    const query = this.repo.createQueryBuilder('project');

    if (filter.status) query.andWhere('project.status = :status', { status: filter.status });
    if (filter.companyId) query.andWhere('project.companyId = :companyId', { companyId: filter.companyId });
    if (filter.specialistId) query.andWhere('project.specialistId = :specialistId', { specialistId: filter.specialistId });

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('project.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  save(project: Project): Promise<Project> {
    return this.repo.save(project);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
