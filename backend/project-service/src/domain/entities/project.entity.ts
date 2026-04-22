import { ProjectStatus } from '../enums/project-status.enum';
import { Milestone } from './milestone.entity';
import { DomainException } from '../exceptions/domain.exception';

export class Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  budget: number;
  deadline: Date;
  status: ProjectStatus;

  /** FK para Identity Context — referência externa */
  companyId: string;

  /** FK para Identity Context — preenchido após bid.accepted */
  specialistId: string;

  /** FK para Bidding Context — referência externa */
  bidId: string;

  milestones: Milestone[];

  createdAt: Date;
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
