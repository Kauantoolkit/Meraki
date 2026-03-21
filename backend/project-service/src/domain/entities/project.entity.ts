import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ProjectStatus } from '../enums/project-status.enum';
import { Milestone } from './milestone.entity';
import { DomainException } from '../exceptions/domain.exception';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  requirements: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column()
  deadline: Date;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  /** FK para Identity Context — referência externa */
  @Column()
  companyId: string;

  /** FK para Identity Context — preenchido após bid.accepted */
  @Column({ nullable: true })
  specialistId: string;

  /** FK para Bidding Context — referência externa */
  @Column({ nullable: true })
  bidId: string;

  @OneToMany(() => Milestone, (m) => m.project, { cascade: true })
  milestones: Milestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  assignSpecialist(specialistId: string, bidId: string): void {
    if (this.status !== ProjectStatus.OPEN) {
      throw new DomainException('Só é possível atribuir especialista a projetos OPEN');
    }
    this.specialistId = specialistId;
    this.bidId = bidId;
    this.status = ProjectStatus.IN_PROGRESS;
  }

  complete(): void {
    if (this.status !== ProjectStatus.IN_PROGRESS) {
      throw new DomainException('Só é possível concluir projetos IN_PROGRESS');
    }
    this.status = ProjectStatus.COMPLETED;
  }

  cancel(): void {
    if (this.status === ProjectStatus.COMPLETED) {
      throw new DomainException('Não é possível cancelar um projeto já concluído');
    }
    this.status = ProjectStatus.CANCELLED;
  }
}
