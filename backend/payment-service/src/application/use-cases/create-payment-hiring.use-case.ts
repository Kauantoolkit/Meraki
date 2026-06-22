import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { CreatePaymentHiringDto } from '../dto/create-payment-hiring.dto';
import { PaymentProvider } from '../../infrastructure/providers/payment-provider.interface';

@Injectable()
export class CreatePaymentHiringUseCase {
  private readonly logger = new Logger(CreatePaymentHiringUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly events: EventPublisherService,
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async execute(dto: CreatePaymentHiringDto, companyId: string) {
    // Buscar os payments já criados pelo bid.accepted (por milestone)
    const existingPayments = await this.paymentRepo.findByProject(dto.projectId);
    const pendingPayments = existingPayments.filter(p => p.status === 'PENDING');

    if (pendingPayments.length === 0) {
      throw new BadRequestException('Nenhum pagamento pendente encontrado para este projeto. Aguarde a aceitação da proposta.');
    }

    // Calcular o total real das milestones
    const totalAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Gerar QR code Pix pelo valor total das milestones
    const paymentMethod = await this.paymentProvider.generatePaymentMethod(totalAmount, {
      projectId: dto.projectId,
      description: `Meraki - Escrow projeto ${dto.projectId}`,
      payerEmail: 'empresa@meraki.com',
    });

    // Salvar o identifier do provedor no primeiro payment (pra rastrear)
    const firstPayment = pendingPayments[0];
    firstPayment.paymentMethod = paymentMethod.type;
    firstPayment.paymentIdentifier = paymentMethod.identifier;
    await this.paymentRepo.save(firstPayment);

    this.logger.log(`Pix gerado para projeto ${dto.projectId}: R$${totalAmount} (${pendingPayments.length} milestones)`);

    return {
      payment: firstPayment,
      paymentMethod: paymentMethod,
    };
  }
}
