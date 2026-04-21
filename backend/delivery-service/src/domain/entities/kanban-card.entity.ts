import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { KanbanColumn } from './kanban-column.entity';
import { DomainException } from '../exceptions/domain.exception';

@Entity('kanban_cards')
export class KanbanCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  columnId: string;

  @ManyToOne(() => KanbanColumn, (col) => col.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'columnId' })
  column: KanbanColumn;

  /** Referência externa para Milestone no Project Context */
  @Column()
  milestoneId: string;

  @Column()
  title: string;

  @Column()
  order: number;

  /** Status espelhado do milestone para visualização */
  @Column({ nullable: true })
  milestoneStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  /** Move o card para outra coluna, resetando a ordem. */
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

  /** Atualiza o título do card. */
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new DomainException('O título do card não pode ser vazio.');
    }
    this.title = title.trim();
  }

  /** Atualiza o status espelhado do milestone. */
  updateMilestoneStatus(status: string): void {
    if (!status || status.trim().length === 0) {
      throw new DomainException('O status do milestone não pode ser vazio.');
    }
    this.milestoneStatus = status.trim();
  }

  /** Reordena o card dentro da mesma coluna. */
  reorder(newOrder: number): void {
    if (newOrder < 0) {
      throw new DomainException('A ordem do card não pode ser negativa.');
    }
    this.order = newOrder;
  }
}
