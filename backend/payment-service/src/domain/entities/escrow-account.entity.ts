import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';
import { Money } from '../value-objects/money.value-object';

export enum EscrowStatus {
  OPEN = 'OPEN',
  HELD = 'HELD',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  FULLY_RELEASED = 'FULLY_RELEASED',
  REFUNDED = 'REFUNDED',
}

@Entity('escrow_accounts')
export class EscrowAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectId: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  heldAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  releasedAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.OPEN })
  status: EscrowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ─────────────────────────────────────────────────

  holdFunds(amount: Money): void {
    if (amount.isZero() || amount.amount <= 0) {
      throw new DomainException('O valor retido deve ser maior que zero');
    }
    if (this.status === EscrowStatus.REFUNDED) {
      throw new DomainException('Não é possível reter fundos em conta reembolsada');
    }
    if (this.status === EscrowStatus.FULLY_RELEASED) {
      throw new DomainException('Não é possível reter fundos em conta totalmente liberada');
    }

    this.heldAmount = Number((Number(this.heldAmount) + amount.amount).toFixed(2));
    this.totalAmount = Number((Number(this.totalAmount) + amount.amount).toFixed(2));
    this.status = EscrowStatus.HELD;
  }

  releaseFunds(amount: Money): void {
    if (this.status !== EscrowStatus.HELD && this.status !== EscrowStatus.PARTIALLY_RELEASED) {
      throw new DomainException('Só é possível liberar fundos quando o status é HELD ou PARTIALLY_RELEASED');
    }
    if (amount.amount > Number(this.heldAmount)) {
      throw new DomainException('Valor a liberar excede o valor retido');
    }

    this.heldAmount = Number((Number(this.heldAmount) - amount.amount).toFixed(2));
    this.releasedAmount = Number((Number(this.releasedAmount) + amount.amount).toFixed(2));

    this.status = this.heldAmount === 0
      ? EscrowStatus.FULLY_RELEASED
      : EscrowStatus.PARTIALLY_RELEASED;
  }

  refund(): void {
    if (this.status === EscrowStatus.REFUNDED) {
      throw new DomainException('Conta já foi reembolsada');
    }
    if (this.status === EscrowStatus.FULLY_RELEASED) {
      throw new DomainException('Não é possível reembolsar conta totalmente liberada');
    }
    if (Number(this.heldAmount) === 0) {
      throw new DomainException('Não há fundos retidos para reembolsar');
    }

    this.heldAmount = 0;
    this.status = EscrowStatus.REFUNDED;
  }
}
