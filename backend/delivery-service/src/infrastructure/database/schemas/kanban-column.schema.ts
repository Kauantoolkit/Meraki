import { EntitySchema } from 'typeorm';
import { KanbanColumn } from '../../../domain/entities/kanban-column.entity';

export const KanbanColumnSchema = new EntitySchema<KanbanColumn>({
  name: 'KanbanColumn',
  target: KanbanColumn,
  tableName: 'kanban_columns',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'varchar' },
    title: { type: 'varchar' },
    order: { type: 'int' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    cards: {
      type: 'one-to-many',
      target: 'KanbanCard',
      inverseSide: 'column',
      cascade: true,
    },
  },
});
