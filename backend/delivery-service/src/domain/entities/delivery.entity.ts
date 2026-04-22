import { DomainException } from '../exceptions/domain.exception';
import { InvalidDeliveryTransitionError } from '../exceptions/invalid-delivery-transition.error';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class Delivery {
  id: string;

  /** Referência externa para Project Context */
  milestoneId: string;
  projectId: string;
  specialistId: string;
  status: DeliveryStatus;
  deliveredFiles: string[];
  deliveryNotes: string;
  rejectionReason: string;
  submittedAt: Date;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  submit(files: string[], notes?: string): void {
    if (this.status !== DeliveryStatus.PENDING && this.status !== DeliveryStatus.REJECTED) {
      throw new InvalidDeliveryTransitionError('submeter', this.status);
    }
    if (!files || files.length === 0) {
      throw new DomainException('A entrega deve conter ao menos um arquivo.');
    }
    this.deliveredFiles = files;
    this.deliveryNotes = notes ?? null;
    this.rejectionReason = null;
    this.status = DeliveryStatus.SUBMITTED;
    this.submittedAt = new Date();
  }

  approve(): void {
    if (this.status !== DeliveryStatus.SUBMITTED) {
      throw new InvalidDeliveryTransitionError('aprovar', this.status);
    }
    this.status = DeliveryStatus.APPROVED;
    this.reviewedAt = new Date();
  }

  reject(reason: string): void {
    if (this.status !== DeliveryStatus.SUBMITTED) {
      throw new InvalidDeliveryTransitionError('rejeitar', this.status);
    }
    if (!reason || reason.trim().length === 0) {
      throw new DomainException('O motivo da rejeição é obrigatório.');
    }
    this.status = DeliveryStatus.REJECTED;
    this.rejectionReason = reason.trim();
    this.reviewedAt = new Date();
  }

  isCompleted(): boolean {
    return this.status === DeliveryStatus.APPROVED;
  }

  canResubmit(): boolean {
    return this.status === DeliveryStatus.REJECTED;
  }
}
