import { DomainException } from '../exceptions/domain.exception';
import { Money } from '../value-objects/money.value-object';

export enum EscrowStatus {
  OPEN = 'OPEN',
  HELD = 'HELD',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  FULLY_RELEASED = 'FULLY_RELEASED',
  REFUNDED = 'REFUNDED',
}

export class EscrowAccount {
  id: string;
  projectId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  status: EscrowStatus;
  createdAt: Date;
  updatedAt: Date;

  // ─── Domain behavior ─────────────���───────────────────────────────────

  holdFunds(amount: Money): void {
    if (amount.isZero() || amount.getAmount() <= 0) {
      throw new DomainException('O valor retido deve ser maior que zero');
    }
    if (this.status === EscrowStatus.REFUNDED) {
      throw new DomainException('Não é possível reter fundos em conta reembolsada');
    }
    if (this.status === EscrowStatus.FULLY_RELEASED) {
      throw new DomainException('Não é possível reter fundos em conta totalmente liberada');
    }

    this.heldAmount = Number((Number(this.heldAmount) + amount.getAmount()).toFixed(2));
    this.totalAmount = Number((Number(this.totalAmount) + amount.getAmount()).toFixed(2));
    this.status = EscrowStatus.HELD;
  }

  releaseFunds(amount: Money): void {
    if (this.status !== EscrowStatus.HELD && this.status !== EscrowStatus.PARTIALLY_RELEASED) {
      throw new DomainException('Só é possível liberar fundos quando o status é HELD ou PARTIALLY_RELEASED');
    }
    if (amount.getAmount() > Number(this.heldAmount)) {
      throw new DomainException('Valor a liberar excede o valor retido');
    }

    this.heldAmount = Number((Number(this.heldAmount) - amount.getAmount()).toFixed(2));
    this.releasedAmount = Number((Number(this.releasedAmount) + amount.getAmount()).toFixed(2));

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
