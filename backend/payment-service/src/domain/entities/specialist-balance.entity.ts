import { DomainException } from '../exceptions/domain.exception';

export class SpecialistBalance {
  id: string;
  specialistId: string;
  totalEarned: number;
  availableBalance: number;
  totalWithdrawn: number;
  createdAt: Date;
  updatedAt: Date;

  // ─── Domain behavior ─────────────────────────────────────────────────────

  credit(amount: number): void {
    if (amount <= 0) {
      throw new DomainException('Valor de crédito deve ser maior que zero');
    }
    this.totalEarned = Number((Number(this.totalEarned) + amount).toFixed(2));
    this.availableBalance = Number((Number(this.availableBalance) + amount).toFixed(2));
  }

  debit(amount: number): void {
    if (amount <= 0) {
      throw new DomainException('Valor de débito deve ser maior que zero');
    }
    if (amount > Number(this.availableBalance)) {
      throw new DomainException('Saldo insuficiente para saque');
    }
    this.availableBalance = Number((Number(this.availableBalance) - amount).toFixed(2));
    this.totalWithdrawn = Number((Number(this.totalWithdrawn) + amount).toFixed(2));
  }

  hasSufficientBalance(amount: number): boolean {
    return Number(this.availableBalance) >= amount;
  }
}
