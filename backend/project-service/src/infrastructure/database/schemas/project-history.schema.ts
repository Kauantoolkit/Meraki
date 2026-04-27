import { EntitySchema } from 'typeorm';
import { ProjectHistory } from '../../../domain/entities/project-history.entity';
import { ProjectHistoryAction } from '../../../domain/enums/project-history-action.enum';

export const ProjectHistorySchema = new EntitySchema<ProjectHistory>({
  name: 'ProjectHistory',
  target: ProjectHistory,
  tableName: 'project_histories',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: String },
    action: { type: 'enum', enum: ProjectHistoryAction },
    description: { type: 'text' },
    createdAt: { type: Date, createDate: true },
  },
});
