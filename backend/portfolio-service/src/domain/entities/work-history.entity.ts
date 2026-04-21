import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

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

  isOngoing(): boolean {
    return !this.completedAt;
  }

  complete(completedAt?: Date): void {
    if (this.completedAt) {
      throw new DomainException('Work history já está concluído');
    }
    const date = completedAt ?? new Date();
    if (date > new Date()) {
      throw new DomainException('Data de conclusão não pode ser no futuro');
    }
    this.completedAt = date;
  }
}
