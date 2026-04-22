import { KanbanColumn } from './kanban-column.entity';
import { DomainException } from '../exceptions/domain.exception';

export class KanbanCard {
  id: string;
  columnId: string;
  column: KanbanColumn;

  /** Referência externa para Milestone no Project Context */
  milestoneId: string;
  title: string;
  order: number;
  milestoneStatus: string;
  createdAt: Date;
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  moveToColumn(columnId: string, newOrder: number): void {
    if (!columnId || columnId.trim().length === 0) {
      throw new DomainException('O ID da coluna de destino é obrigatório.');
    }
    if (newOrder < 0) {
      throw new DomainException('A ordem do card não pode ser negativa.');
    }
    this.columnId = columnId;
    this.order = newOrder;
  }

  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new DomainException('O título do card não pode ser vazio.');
    }
    this.title = title.trim();
  }

  updateMilestoneStatus(status: string): void {
    if (!status || status.trim().length === 0) {
      throw new DomainException('O status do milestone não pode ser vazio.');
    }
    this.milestoneStatus = status.trim();
  }

  reorder(newOrder: number): void {
    if (newOrder < 0) {
      throw new DomainException('A ordem do card não pode ser negativa.');
    }
    this.order = newOrder;
  }
}
