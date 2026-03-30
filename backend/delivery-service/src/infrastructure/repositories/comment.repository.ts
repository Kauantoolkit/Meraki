import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MilestoneComment } from '../../domain/entities/milestone-comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(MilestoneComment)
    private readonly repo: Repository<MilestoneComment>,
  ) {}

  save(comment: Partial<MilestoneComment>): Promise<MilestoneComment> {
    return this.repo.save(this.repo.create(comment));
  }

  findByMilestone(milestoneId: string): Promise<MilestoneComment[]> {
    return this.repo.find({ where: { milestoneId }, order: { createdAt: 'ASC' } });
  }
}
