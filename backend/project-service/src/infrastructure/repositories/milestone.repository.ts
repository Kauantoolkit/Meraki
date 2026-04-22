import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from '../../domain/entities/milestone.entity';
import { IMilestoneRepository } from '../../domain/repositories/milestone.repository.interface';

@Injectable()
export class MilestoneRepository implements IMilestoneRepository {
  constructor(
    @InjectRepository(Milestone)
    private readonly repo: Repository<Milestone>,
  ) {}

  findById(id: string): Promise<Milestone | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByProject(projectId: string): Promise<Milestone[]> {
    return this.repo.find({
      where: { projectId },
      order: { order: 'ASC' },
    });
  }

  save(milestone: Milestone): Promise<Milestone> {
    return this.repo.save(milestone);
  }

  saveMany(milestones: Milestone[]): Promise<Milestone[]> {
    return this.repo.save(milestones);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
