import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from '../../infrastructure/repositories/escrow-account.repository';
import { EscrowAccount } from '../../domain/entities/escrow-account.entity';
import { PaymentProvider } from '../../infrastructure/providers/payment-provider.interface';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { PaymentStatus } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money.value-object';

@Injectable()
export class ConfirmPaymentUseCase {
  private readonly logger = new Logger(ConfirmPaymentUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly escrowRepo: EscrowAccountRepository,
    private readonly paymentProvider: PaymentProvider,
    private readonly events: EventPublisherService,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    if (payment.status !== 'PENDING') {
      throw new BadRequestException(`Pagamento não pode ser confirmado no estado atual: ${payment.status}`);
    }

    // 1. Verify payment with the provider
    const verification = await this.paymentProvider.verifyPayment(paymentId);
    if (verification.status !== 'PAID') {
      throw new BadRequestException('O provedor de pagamento não confirmou o recebimento dos fundos.');
    }

    // 2. Update payment status to ESCROW_HELD
    payment.status = PaymentStatus.ESCROW_HELD;
    await this.paymentRepo.save(payment);

    // 3. Update Project Escrow Account
    let escrow = await this.escrowRepo.findByProject(payment.projectId);
    if (!escrow) {
      escrow = new EscrowAccount();
      escrow.projectId = payment.projectId;
      escrow.totalAmount = 0;
      escrow.heldAmount = 0;
      escrow.releasedAmount = 0;
    }

    escrow.holdFunds(new Money(payment.amount));
    await this.escrowRepo.save(escrow);

    this.logger.log(`Pagamento ${paymentId} confirmado e movido para escrow: R$${payment.amount}`);

    return { payment, escrow };
  }
}
