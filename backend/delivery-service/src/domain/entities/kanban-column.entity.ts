import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn,
} from 'typeorm';
import { KanbanCard } from './kanban-card.entity';
import { DomainException } from '../exceptions/domain.exception';

@Entity('kanban_columns')
export class KanbanColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  title: string;

  @Column()
  order: number;

  @OneToMany(() => KanbanCard, (c) => c.column, { cascade: true })
  cards: KanbanCard[];

  @CreateDateColumn()
  createdAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  /** Renomeia a coluna. */
  rename(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new DomainException('O título da coluna não pode ser vazio.');
    }
    this.title = newTitle.trim();
  }

  /** Atualiza a posição da coluna no board. */
  updateOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new DomainException('A ordem da coluna não pode ser negativa.');
    }
    this.order = newOrder;
  }

  /** Verifica se a coluna possui cards. */
  hasCards(): boolean {
    return this.cards && this.cards.length > 0;
  }
}
