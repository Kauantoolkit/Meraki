import { Injectable, Inject } from '@nestjs/common';
import { Payment } from './domain/entities/payment.entity';
import { Withdrawal } from './domain/entities/withdrawal.entity';
import { IPaymentRepository } from './domain/repositories/payment.repository.interface';
import { IWithdrawalRepository } from './domain/repositories/withdrawal.repository.interface';
import { PaymentStatus } from './domain/enums/payment-status.enum';
import { WithdrawalStatus } from './domain/enums/withdrawal-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IWithdrawalRepository')
    private readonly withdrawalRepository: IWithdrawalRepository,
  ) {}

  async getPaymentStats(): Promise<any> {
    const [pendingPayments, completedPayments, failedPayments, cancelledPayments] =
      await Promise.all([
        this.paymentRepository.findByStatus(PaymentStatus.PENDING),
        this.paymentRepository.findByStatus(PaymentStatus.COMPLETED),
        this.paymentRepository.findByStatus(PaymentStatus.FAILED),
        this.paymentRepository.findByStatus(PaymentStatus.CANCELLED),
      ]);

    const [pendingWithdrawals, approvedWithdrawals, completedWithdrawals, failedWithdrawals] =
      await Promise.all([
        this.withdrawalRepository.findByStatus(WithdrawalStatus.PENDING),
        this.withdrawalRepository.findByStatus(WithdrawalStatus.APPROVED),
        this.withdrawalRepository.findByStatus(WithdrawalStatus.COMPLETED),
        this.withdrawalRepository.findByStatus(WithdrawalStatus.FAILED),
      ]);

    const totalPaymentAmount = completedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0,
    );

    const totalWithdrawnAmount = completedWithdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amount.toString()),
      0,
    );

    return {
      payments: {
        total: pendingPayments.length + completedPayments.length + failedPayments.length + cancelledPayments.length,
        pending: pendingPayments.length,
        completed: completedPayments.length,
        failed: failedPayments.length,
        cancelled: cancelledPayments.length,
        totalAmount: totalPaymentAmount,
      },
      withdrawals: {
        total: pendingWithdrawals.length + approvedWithdrawals.length + completedWithdrawals.length + failedWithdrawals.length,
        pending: pendingWithdrawals.length,
        approved: approvedWithdrawals.length,
        completed: completedWithdrawals.length,
        failed: failedWithdrawals.length,
        totalAmount: totalWithdrawnAmount,
      },
    };
  }
}
