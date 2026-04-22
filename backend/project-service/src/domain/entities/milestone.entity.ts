import { MilestoneStatus } from '../enums/milestone-status.enum';
import { Project } from './project.entity';
import { MilestoneNotSequentialError } from '../exceptions/milestone-not-sequential.error';
import { InvalidMilestoneTransitionError } from '../exceptions/invalid-milestone-transition.error';
import { DomainException } from '../exceptions/domain.exception';

export class Milestone {
  id: string;
  projectId: string;
  project: Project;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;

  /** Ordem sequencial — usado na invariante RN04 */
  order: number;

  dueDate: Date;
  createdAt: Date;
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
