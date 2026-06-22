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
    return this.confirmProjectEscrow(payment);
  }

  async executeByExternalId(externalId: string) {
    const payment = await this.paymentRepo.findByPaymentIdentifier(externalId);
    if (!payment) throw new NotFoundException('Pagamento não encontrado para externalId: ' + externalId);
    return this.confirmProjectEscrow(payment);
  }

  /**
   * Confirma o Pix de depósito do projeto inteiro.
   * Verifica com o provedor (Mercado Pago) e move TODOS os payments
   * PENDING do projeto para ESCROW_HELD.
   */
  private async confirmProjectEscrow(hiringPayment: any) {
    if (hiringPayment.status !== 'PENDING') {
      throw new BadRequestException(`Pagamento não pode ser confirmado no estado atual: ${hiringPayment.status}`);
    }

    // 1. Verificar pagamento com o provedor
    const verificationId = hiringPayment.paymentIdentifier || hiringPayment.id;
    const verification = await this.paymentProvider.verifyPayment(verificationId);
    if (verification.status !== 'PAID') {
      throw new BadRequestException('O provedor de pagamento não confirmou o recebimento dos fundos.');
    }

    // 2. Confirmar o hiring payment
    hiringPayment.status = PaymentStatus.ESCROW_HELD;
    hiringPayment.escrowTransactionId = `escrow-${Date.now()}`;
    await this.paymentRepo.save(hiringPayment);

    // 3. Mover TODOS os payments PENDING do projeto para ESCROW_HELD
    const allPayments = await this.paymentRepo.findByProject(hiringPayment.projectId);
    let totalHeld = 0;
    for (const p of allPayments) {
      if (p.status === PaymentStatus.PENDING && p.id !== hiringPayment.id) {
        p.status = PaymentStatus.ESCROW_HELD;
        p.escrowTransactionId = `escrow-${Date.now()}`;
        await this.paymentRepo.save(p);
      }
      if (p.status === PaymentStatus.ESCROW_HELD) {
        totalHeld += Number(p.amount);
      }
    }

    // 4. Atualizar escrow do projeto
    let escrow = await this.escrowRepo.findByProject(hiringPayment.projectId);
    if (!escrow) {
      escrow = new EscrowAccount();
      escrow.projectId = hiringPayment.projectId;
      escrow.totalAmount = 0;
      escrow.heldAmount = 0;
      escrow.releasedAmount = 0;
    }
    escrow.holdFunds(new Money(totalHeld - escrow.heldAmount));
    await this.escrowRepo.save(escrow);

    this.logger.log(`Escrow confirmado para projeto ${hiringPayment.projectId}: R$${totalHeld} retido`);

    return { payment: hiringPayment, escrow };
  }
}
