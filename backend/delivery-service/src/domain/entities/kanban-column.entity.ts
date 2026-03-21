import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn,
} from 'typeorm';
import { KanbanCard } from './kanban-card.entity';

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
}
