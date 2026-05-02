import { DomainException } from '../exceptions/domain.exception';
import { WithdrawalStatus } from '../enums/withdrawal-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class Withdrawal {
  id: string;
  specialistId: string;
  amount: number;
  method: PaymentMethod;
  pixKey: string;
  bankDetails: string;
  status: WithdrawalStatus;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // ─── Domain behavior ─────────────────────────────────────────────────────

  approve(): void {
    if (this.status !== WithdrawalStatus.PENDING) {
      throw new DomainException('Só é possível aprovar saques com status PENDING');
    }
    this.status = WithdrawalStatus.APPROVED;
  }

  reject(): void {
    if (this.status !== WithdrawalStatus.PENDING) {
      throw new DomainException('Só é possível rejeitar saques com status PENDING');
    }
    this.status = WithdrawalStatus.REJECTED;
  }

  startProcessing(): void {
    if (this.status !== WithdrawalStatus.APPROVED) {
      throw new DomainException('Só é possível processar saques com status APPROVED');
    }
    this.status = WithdrawalStatus.PROCESSING;
  }

  complete(): void {
    if (this.status !== WithdrawalStatus.PROCESSING) {
      throw new DomainException('Só é possível completar saques com status PROCESSING');
    }
    this.status = WithdrawalStatus.COMPLETED;
    this.processedAt = new Date();
  }

  fail(): void {
    if (this.status !== WithdrawalStatus.PROCESSING) {
      throw new DomainException('Só é possível falhar saques com status PROCESSING');
    }
    this.status = WithdrawalStatus.FAILED;
  }

  validatePixKey(): void {
    if (this.method === PaymentMethod.PIX && !this.pixKey) {
      throw new DomainException('Chave PIX é obrigatória para saques via PIX');
    }
  }
}
