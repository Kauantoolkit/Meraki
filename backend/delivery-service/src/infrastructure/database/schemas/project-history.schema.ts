import { EntitySchema } from 'typeorm';
import { ProjectHistory } from '../../../domain/entities/project-history.entity';

export const ProjectHistorySchema = new EntitySchema<ProjectHistory>({
  name: 'ProjectHistory',
  target: ProjectHistory,
  tableName: 'project_histories',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'varchar' },
    specialistId: { type: 'varchar', nullable: true },
    action: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
});
