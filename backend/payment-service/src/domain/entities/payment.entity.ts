import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { PaymentNotInEscrowError } from '../exceptions/payment-not-in-escrow.error';

export enum PaymentStatus {
  ESCROW_HELD = 'ESCROW_HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  milestoneId: string;

  @Column()
  specialistId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  specialistAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  platformFee: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.ESCROW_HELD })
  status: PaymentStatus;

  @Column({ nullable: true })
  escrowTransactionId: string;

  @Column({ nullable: true })
  releaseTransactionId: string;

  @Column({ nullable: true })
  releasedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior — RN06 ───────────────────────────────────────────────

  release(feeRate: number): { specialistAmount: number; platformFee: number } {
    if (this.status !== PaymentStatus.ESCROW_HELD) {
      throw new PaymentNotInEscrowError();
    }
    const fee = Number((this.amount * feeRate).toFixed(2));
    const specialist = Number((this.amount - fee).toFixed(2));

    this.platformFee = fee;
    this.specialistAmount = specialist;
    this.status = PaymentStatus.RELEASED;
    this.releasedAt = new Date();

    return { specialistAmount: specialist, platformFee: fee };
  }
}
