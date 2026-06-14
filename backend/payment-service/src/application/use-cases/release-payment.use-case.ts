import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from '../../infrastructure/repositories/escrow-account.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { FeeCalculationDomainService } from '../../domain/services/fee-calculation.domain-service';
import { PaymentReleasedEvent } from '../../domain/events/payment-released.event';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';
import { Money } from '../../domain/value-objects/money.value-object';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';

export interface ReleasePaymentDto {
  milestoneId: string;
  projectId: string;
  amount: number;
  specialistId: string;
}

@Injectable()
export class ReleasePaymentUseCase {
  private readonly logger = new Logger(ReleasePaymentUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly escrowRepo: EscrowAccountRepository,
    private readonly balanceRepo: SpecialistBalanceRepository,
    private readonly feeService: FeeCalculationDomainService,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: ReleasePaymentDto): Promise<void> {
    // 1. Busca o pagamento em ESCROW correspondente ao milestone
    const payment = await this.paymentRepo.findByMilestone(dto.milestoneId);
    if (!payment) {
      throw new NotFoundException('Pagamento em escrow não encontrado para este milestone.');
    }

    // 2. Aplica RN06 — calcula taxa e libera
    const { specialistAmount, platformFee } = payment.release(this.feeService.rate);
    payment.releaseTransactionId = `rel-${Date.now()}`;
    await this.paymentRepo.save(payment);

    // 3. Atualiza EscrowAccount do projeto
    const escrow = await this.escrowRepo.findByProject(dto.projectId);
    if (!escrow) {
      throw new BadRequestException('Conta de escrow do projeto não encontrada.');
    }
    escrow.releaseFunds(new Money(dto.amount));
    await this.escrowRepo.save(escrow);

    // 4. Atualiza saldo do especialista (crédito após fee)
    let balance = await this.balanceRepo.findBySpecialist(dto.specialistId);
    if (!balance) {
      balance = new SpecialistBalance();
      balance.specialistId = dto.specialistId;
      balance.totalEarned = 0;
      balance.availableBalance = 0;
      balance.totalWithdrawn = 0;
    }
    balance.credit(specialistAmount);
    await this.balanceRepo.save(balance);

    // 5. Domain Event → publica payment.released
    const event = new PaymentReleasedEvent({
      paymentId: payment.id,
      milestoneId: dto.milestoneId,
      projectId: dto.projectId,
      amount: dto.amount,
      specialistAmount,
      platformFee,
      specialistId: dto.specialistId,
    });
    await this.events.publishPaymentReleased(event.payload);

    this.logger.log(`Pagamento liberado: R$${specialistAmount} para especialista, R$${platformFee} para plataforma`);
  }
}
