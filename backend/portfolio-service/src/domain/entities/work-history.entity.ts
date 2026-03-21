import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** Histórico profissional do especialista — RF11, RF14 */
@Entity('work_histories')
export class WorkHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  specialistId: string;

  @Column()
  projectId: string;

  @Column({ nullable: true })
  projectTitle: string;

  @Column({ nullable: true })
  companyId: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amountEarned: number;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
