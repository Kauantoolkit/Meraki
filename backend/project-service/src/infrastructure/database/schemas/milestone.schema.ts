import { EntitySchema } from 'typeorm';
import { Milestone } from '../../../domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../domain/enums/milestone-status.enum';

export const MilestoneSchema = new EntitySchema<Milestone>({
  name: 'Milestone',
  target: Milestone,
  tableName: 'milestones',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: String },
    title: { type: String },
    description: { type: 'text' },
    amount: { type: 'decimal', precision: 10, scale: 2 },
    status: { type: 'enum', enum: MilestoneStatus, default: MilestoneStatus.PENDING },
    order: { type: Number },
    dueDate: { type: Date, nullable: true },
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      inverseSide: 'milestones',
      joinColumn: { name: 'projectId' },
      onDelete: 'CASCADE',
    },
  },
});
