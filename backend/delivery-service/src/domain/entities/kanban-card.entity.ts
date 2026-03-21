import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { KanbanColumn } from './kanban-column.entity';

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
}
