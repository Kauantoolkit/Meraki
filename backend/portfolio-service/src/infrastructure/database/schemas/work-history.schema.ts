import { EntitySchema } from 'typeorm';
import { WorkHistory } from '../../../domain/entities/work-history.entity';

export const WorkHistorySchema = new EntitySchema<WorkHistory>({
  name: 'WorkHistory',
  target: WorkHistory,
  tableName: 'work_histories',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar' },
    projectId: { type: 'varchar' },
    projectTitle: { type: 'varchar', nullable: true },
    companyId: { type: 'varchar', nullable: true },
    amountEarned: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    completedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
});
