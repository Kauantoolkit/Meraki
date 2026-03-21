import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { BidStatus } from '../enums/bid-status.enum';
import { BidMessage } from './bid-message.entity';
import { DomainException } from '../exceptions/domain.exception';

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
      throw new DomainException('Só é possível aceitar propostas PENDING');
    }
    this.status = BidStatus.ACCEPTED;
  }

  reject(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new DomainException('Só é possível rejeitar propostas PENDING');
    }
    this.status = BidStatus.REJECTED;
  }

  withdraw(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new DomainException('Só é possível retirar propostas PENDING');
    }
    this.status = BidStatus.WITHDRAWN;
  }
}
