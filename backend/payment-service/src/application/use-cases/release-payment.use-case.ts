import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from '../../infrastructure/repositories/escrow-account.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { FeeCalculationDomainService } from '../../domain/services/fee-calculation.domain-service';
import { PaymentReleasedEvent } from '../../domain/events/payment-released.event';
import { EscrowAccount } from '../../domain/entities/escrow-account.entity';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';
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
    private readonly disputeRepo: DisputeRepository,
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async execute(dto: ReleasePaymentDto): Promise<void> {
    // Verificação de Disputa (DRS v2.0)
    const activeDispute = await this.disputeRepo.findByMilestoneId(dto.milestoneId);
    if (activeDispute && activeDispute.status === 'OPEN') {
      throw new BadRequestException('Não é possível liberar pagamento para um milestone em disputa.');
    }

    // 1. Busca o pagamento em ESCROW correspondente ao milestone
    const payment = await this.paymentRepo.findByMilestone(dto.milestoneId);
    if (!payment) {
      throw new NotFoundException('Pagamento em escrow não encontrado para este milestone.');
    }

    // 2. Aplica RN06 via Domain Entity — calcula taxa e libera
    // payment.release() valida se o status é ESCROW_HELD
    const { specialistAmount, platformFee } = payment.release(this.feeService.rate);
    payment.releaseTransactionId = `rel-${Date.now()}`;
    await this.paymentRepo.save(payment);

    // 3. Atualiza ou cria EscrowAccount do projeto
    let escrow = await this.escrowRepo.findByProject(dto.projectId);
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

    // 5. Executa a transferência real via Provedor
    await this.paymentProvider.transferFunds(specialistAmount, dto.specialistId);

    // 6. Domain Event tipado → publica payment.released
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
