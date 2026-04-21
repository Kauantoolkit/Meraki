import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { BidStatus } from '../enums/bid-status.enum';
import { BidMessage } from './bid-message.entity';
import { BidNotPendingError } from '../exceptions/bid-not-pending.error';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** FK para Project Context — referência externa */
  @Column()
  projectId: string;

  /** FK para Identity Context — referência externa */
  @Column()
  specialistId: string;

  @Column('text')
  proposal: string;

  @Column('decimal', { precision: 10, scale: 2 })
  proposedBudget: number;

  @Column()
  estimatedDuration: number; // dias

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.PENDING })
  status: BidStatus;

  @OneToMany(() => BidMessage, (m) => m.bid, { cascade: true })
  messages: BidMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  accept(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('aceitar');
    }
    this.status = BidStatus.ACCEPTED;
  }

  reject(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('rejeitar');
    }
    this.status = BidStatus.REJECTED;
  }

  withdraw(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('retirar');
    }
    this.status = BidStatus.WITHDRAWN;
  }
}
