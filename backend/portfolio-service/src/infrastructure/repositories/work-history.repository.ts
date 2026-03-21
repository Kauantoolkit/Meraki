import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkHistory } from '../../domain/entities/work-history.entity';
import { IWorkHistoryRepository } from '../../domain/repositories/i-work-history.repository';

@Injectable()
export class WorkHistoryRepository implements IWorkHistoryRepository {
  constructor(
    @InjectRepository(WorkHistory)
    private readonly repo: Repository<WorkHistory>,
  ) {}

  save(history: Partial<WorkHistory>): Promise<WorkHistory> {
    return this.repo.save(this.repo.create(history));
  }

  findBySpecialist(specialistId: string): Promise<WorkHistory[]> {
    return this.repo.find({ where: { specialistId }, order: { completedAt: 'DESC' } });
  }
}
