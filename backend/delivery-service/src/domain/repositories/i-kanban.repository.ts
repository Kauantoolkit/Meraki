import { KanbanColumn } from '../entities/kanban-column.entity';
import { KanbanCard } from '../entities/kanban-card.entity';

export interface IKanbanRepository {
  findColumnsByProject(projectId: string): Promise<KanbanColumn[]>;
  findFirstColumn(projectId: string): Promise<KanbanColumn | null>;
  saveColumns(columns: KanbanColumn[]): Promise<KanbanColumn[]>;
  saveCard(card: KanbanCard): Promise<KanbanCard>;
  updateCardStatus(milestoneId: string, status: string): Promise<void>;
}
