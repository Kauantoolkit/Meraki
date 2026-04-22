import { EntitySchema } from 'typeorm';
import { KanbanCard } from '../../../domain/entities/kanban-card.entity';

export const KanbanCardSchema = new EntitySchema<KanbanCard>({
  name: 'KanbanCard',
  target: KanbanCard,
  tableName: 'kanban_cards',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    columnId: { type: 'varchar' },
    milestoneId: { type: 'varchar' },
    title: { type: 'varchar' },
    order: { type: 'int' },
    milestoneStatus: { type: 'varchar', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    column: {
      type: 'many-to-one',
      target: 'KanbanColumn',
      inverseSide: 'cards',
      joinColumn: { name: 'columnId' },
      onDelete: 'CASCADE',
    },
  },
});
