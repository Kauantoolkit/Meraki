import { EntitySchema } from 'typeorm';
import { MilestoneComment } from '../../../domain/entities/milestone-comment.entity';

export const MilestoneCommentSchema = new EntitySchema<MilestoneComment>({
  name: 'MilestoneComment',
  target: MilestoneComment,
  tableName: 'milestone_comments',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    milestoneId: { type: 'varchar' },
    userId: { type: 'varchar' },
    comment: { type: 'text' },
    editedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
