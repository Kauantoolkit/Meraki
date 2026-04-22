import { EntitySchema } from 'typeorm';
import { Project } from '../../../domain/entities/project.entity';
import { ProjectStatus } from '../../../domain/enums/project-status.enum';

export const ProjectSchema = new EntitySchema<Project>({
  name: 'Project',
  target: Project,
  tableName: 'projects',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    title: { type: String },
    description: { type: 'text' },
    requirements: { type: 'simple-array' },
    budget: { type: 'decimal', precision: 10, scale: 2 },
    deadline: { type: Date },
    status: { type: 'enum', enum: ProjectStatus, default: ProjectStatus.OPEN },
    companyId: { type: String },
    specialistId: { type: String, nullable: true },
    bidId: { type: String, nullable: true },
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true },
  },
  relations: {
    milestones: {
      type: 'one-to-many',
      target: 'Milestone',
      inverseSide: 'project',
      cascade: true,
    },
  },
});
