import { DomainException } from '../exceptions/domain.exception';

export enum DisputeStatus {
  OPEN = 'OPEN',
  RESOLVED_Spezialist = 'RESOLVED_SPECIALIST',
  RESOLVED_Company = 'RESOLVED_COMPANY',
}

export class Dispute {
  id: string;
  projectId: string;
  milestoneId: string;
  reason: string;
  status: DisputeStatus;
  createdAt: Date;
  resolvedAt: Date | null = null;

  open(reason: string): void {
    this.reason = reason;
    this.status = DisputeStatus.OPEN;
    this.createdAt = new Date();
  }

  resolve(winner: 'SPECIALIST' | 'COMPANY'): void {
    this.status = winner === 'SPECIALIST' ? DisputeStatus.RESOLVED_Spezialist : DisputeStatus.RESOLVED_Company;
    this.resolvedAt = new Date();
  }
}
