import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../../infrastructure/repositories/comment.repository';

@Injectable()
export class GetMilestoneCommentsUseCase {
  constructor(private readonly commentRepo: CommentRepository) {}

  execute(milestoneId: string) {
    return this.commentRepo.findByMilestone(milestoneId);
  }
}
