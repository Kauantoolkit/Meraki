import { Injectable, Logger } from '@nestjs/common';
import { PaymentFactory } from '../../domain/factories/payment.factory';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from '../../infrastructure/repositories/escrow-account.repository';
import { FeeCalculationDomainService } from '../../domain/services/fee-calculation.domain-service';
import { PaymentReleasedEvent } from '../../domain/events/payment-released.event';
import { EscrowAccount } from '../../domain/entities/escrow-account.entity';
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
    private readonly paymentFactory: PaymentFactory,
    private readonly paymentRepo: PaymentRepository,
    private readonly escrowRepo: EscrowAccountRepository,
    private readonly feeService: FeeCalculationDomainService,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: ReleasePaymentDto): Promise<void> {
    // 1. Cria payment via Factory (garante consistência)
    const payment = this.paymentFactory.create(dto);

    // 2. Aplica RN06 via Domain Service — calcula taxa e libera
    const { specialistAmount, platformFee } = payment.release(this.feeService.rate);
    payment.releaseTransactionId = `release-${Date.now()}`;
    await this.paymentRepo.save(payment);

    // 3. Atualiza ou cria EscrowAccount do projeto
    let escrow = await this.escrowRepo.findByProject(dto.projectId);
    if (!escrow) {
      escrow = new EscrowAccount();
      escrow.projectId = dto.projectId;
      escrow.totalAmount = 0;
      escrow.heldAmount = 0;
      escrow.releasedAmount = 0;
    }
    escrow.totalAmount = Number(escrow.totalAmount) + dto.amount;
    escrow.releasedAmount = Number(escrow.releasedAmount) + dto.amount;
    await this.escrowRepo.save(escrow);

    // 4. Domain Event tipado → publica payment.released
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

    this.logger.log(`Pagamento liberado: ${specialistAmount} para especialista, ${platformFee} para plataforma`);
  }
}
