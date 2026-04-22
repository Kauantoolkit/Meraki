import { KanbanCard } from './kanban-card.entity';
import { DomainException } from '../exceptions/domain.exception';

export class KanbanColumn {
  id: string;
  projectId: string;
  title: string;
  order: number;
  cards: KanbanCard[];
  createdAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  rename(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new DomainException('O título da coluna não pode ser vazio.');
    }
    this.title = newTitle.trim();
  }

  updateOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new DomainException('A ordem da coluna não pode ser negativa.');
    }
    this.order = newOrder;
  }

  hasCards(): boolean {
    return this.cards && this.cards.length > 0;
  }
}
