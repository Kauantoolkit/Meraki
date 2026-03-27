import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';

@Injectable()
export class ConfirmPaymentHiringUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('ISpecialistBalanceRepository')
    private readonly balanceRepository: ISpecialistBalanceRepository,
  ) {}

  async execute(paymentId: string): Promise<any> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    // Atualizar status para COMPLETED
    const updatedPayment = await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.COMPLETED,
      transactionId: `TXN-${Date.now()}`,
      completedAt: new Date(),
    });

    if (!updatedPayment) {
      throw new BadRequestException('Failed to update payment');
    }

    // Incrementar saldo do especialista
    let balance = await this.balanceRepository.findBySpecialistId(
      payment.specialistId,
    );

    if (!balance) {
      // Criar novo registro de saldo se não existir
      balance = await this.balanceRepository.create({
        specialistId: payment.specialistId,
        totalEarned: payment.amount,
        availableBalance: payment.amount,
        totalWithdrawn: 0,
      });
    } else {
      // Incrementar saldo existente
      await this.balanceRepository.update(payment.specialistId, {
        totalEarned:
          parseFloat(balance.totalEarned.toString()) +
          parseFloat(payment.amount.toString()),
        availableBalance:
          parseFloat(balance.availableBalance.toString()) +
          parseFloat(payment.amount.toString()),
      });
    }

    return {
      id: updatedPayment.id,
      specialistId: updatedPayment.specialistId,
      companyId: updatedPayment.companyId,
      projectId: updatedPayment.projectId,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      transactionId: updatedPayment.transactionId,
      completedAt: updatedPayment.completedAt,
      message: `Payment confirmed. Specialist balance increased by R$ ${payment.amount}`,
    };
  }
}
