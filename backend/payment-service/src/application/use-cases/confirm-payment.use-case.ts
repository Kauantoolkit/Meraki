import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { FeeCalculationDomainService } from '../../domain/services/fee-calculation.domain-service';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';

@Injectable()
export class ConfirmPaymentUseCase {
  private readonly logger = new Logger(ConfirmPaymentUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly balanceRepo: SpecialistBalanceRepository,
    private readonly feeService: FeeCalculationDomainService,
    private readonly events: EventPublisherService,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    const { specialistAmount, platformFee } = payment.release(this.feeService.rate);
    payment.releaseTransactionId = `release-${Date.now()}`;
    await this.paymentRepo.save(payment);

    // Atualiza saldo do especialista
    let balance = await this.balanceRepo.findBySpecialist(payment.specialistId);
    if (!balance) {
      balance = new SpecialistBalance();
      balance.specialistId = payment.specialistId;
      balance.totalEarned = 0;
      balance.availableBalance = 0;
      balance.totalWithdrawn = 0;
    }
    balance.credit(specialistAmount);
    await this.balanceRepo.save(balance);

    await this.events.publishPaymentReleased({
      paymentId: payment.id,
      milestoneId: payment.milestoneId,
      projectId: payment.projectId,
      amount: payment.amount,
      specialistAmount,
      platformFee,
      specialistId: payment.specialistId,
    });

    this.logger.log(`Pagamento ${paymentId} confirmado: R$${specialistAmount} para especialista`);

    return { payment, specialistAmount, platformFee };
  }
}
