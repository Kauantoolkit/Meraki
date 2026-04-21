import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { MilestoneStatus } from '../enums/milestone-status.enum';
import { Project } from './project.entity';
import { MilestoneNotSequentialError } from '../exceptions/milestone-not-sequential.error';
import { InvalidMilestoneTransitionError } from '../exceptions/invalid-milestone-transition.error';
import { DomainException } from '../exceptions/domain.exception';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (p) => p.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: MilestoneStatus, default: MilestoneStatus.PENDING })
  status: MilestoneStatus;

  /** Ordem sequencial — usado na invariante RN04 */
  @Column()
  order: number;

  @Column({ nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior (invariante RN04) ────────────────────────────────────

  /**
   * RN04: Milestones devem ser concluídas sequencialmente.
   * Não é possível iniciar um milestone se houver anterior não APPROVED.
   */
  start(allMilestones: Milestone[]): void {
    const previousNotApproved = allMilestones.filter(
      (m) => m.order < this.order && m.status !== MilestoneStatus.APPROVED,
    );
    if (previousNotApproved.length > 0) {
      throw new MilestoneNotSequentialError(this.order);
    }
    if (this.status !== MilestoneStatus.PENDING) {
      throw new DomainException('Milestone já foi iniciado');
    }
    this.status = MilestoneStatus.IN_PROGRESS;
  }

  submit(): void {
    if (this.status !== MilestoneStatus.IN_PROGRESS) {
      throw new InvalidMilestoneTransitionError('submeter', 'IN_PROGRESS');
    }
    this.status = MilestoneStatus.SUBMITTED;
  }

  approve(): void {
    if (this.status !== MilestoneStatus.SUBMITTED) {
      throw new InvalidMilestoneTransitionError('aprovar', 'SUBMITTED');
    }
    this.status = MilestoneStatus.APPROVED;
  }

  reject(): void {
    if (this.status !== MilestoneStatus.SUBMITTED) {
      throw new InvalidMilestoneTransitionError('rejeitar', 'SUBMITTED');
    }
    this.status = MilestoneStatus.IN_PROGRESS;
  }
}
