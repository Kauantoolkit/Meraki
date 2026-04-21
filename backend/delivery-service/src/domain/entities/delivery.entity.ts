import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';
import { InvalidDeliveryTransitionError } from '../exceptions/invalid-delivery-transition.error';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referência externa para Project Context */
  @Column()
  milestoneId: string;

  @Column()
  projectId: string;

  @Column()
  specialistId: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @Column('simple-array', { nullable: true })
  deliveredFiles: string[];

  @Column('text', { nullable: true })
  deliveryNotes: string;

  @Column('text', { nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  /**
   * Submete a entrega para revisão.
   * Transição permitida: PENDING | REJECTED → SUBMITTED
   */
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

  /**
   * Aprova a entrega (RN05 — validação pela empresa).
   * Transição permitida: SUBMITTED → APPROVED
   */
  approve(): void {
    if (this.status !== DeliveryStatus.SUBMITTED) {
      throw new InvalidDeliveryTransitionError('aprovar', this.status);
    }
    this.status = DeliveryStatus.APPROVED;
    this.reviewedAt = new Date();
  }

  /**
   * Rejeita a entrega com motivo obrigatório.
   * Transição permitida: SUBMITTED → REJECTED
   */
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

  /** Verifica se a entrega foi concluída (aprovada). */
  isCompleted(): boolean {
    return this.status === DeliveryStatus.APPROVED;
  }

  /** Verifica se a entrega pode ser re-submetida. */
  canResubmit(): boolean {
    return this.status === DeliveryStatus.REJECTED;
  }
}
