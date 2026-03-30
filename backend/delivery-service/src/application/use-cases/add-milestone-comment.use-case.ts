import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../../infrastructure/repositories/comment.repository';

@Injectable()
export class AddMilestoneCommentUseCase {
  constructor(private readonly commentRepo: CommentRepository) {}

  async execute(milestoneId: string, userId: string, comment: string): Promise<void> {
    await this.commentRepo.save({ milestoneId, userId, comment });
  }
}
