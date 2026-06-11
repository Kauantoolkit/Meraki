import { Injectable, Logger } from '@nestjs/common';
import { PaymentFactory } from '../../domain/factories/payment.factory';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { CreatePaymentHiringDto } from '../dto/create-payment-hiring.dto';
import { PaymentProvider } from '../../infrastructure/providers/payment-provider.interface';

@Injectable()
export class CreatePaymentHiringUseCase {
  private readonly logger = new Logger(CreatePaymentHiringUseCase.name);

  constructor(
    private readonly paymentFactory: PaymentFactory,
    private readonly paymentRepo: PaymentRepository,
    private readonly events: EventPublisherService,
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async execute(dto: CreatePaymentHiringDto, companyId: string) {
    const payment = this.paymentFactory.create({
      milestoneId: dto.milestoneId || `hiring-${Date.now()}`,
      projectId: dto.projectId,
      specialistId: dto.specialistId,
      amount: dto.amount,
    });

    // Generate payment method (Pix key/QR code) via provider
    const paymentMethod = await this.paymentProvider.generatePaymentMethod(dto.amount, {
      projectId: dto.projectId,
      milestoneId: payment.milestoneId,
    });

    // Save payment record with provider details
    payment.paymentMethod = paymentMethod.type;
    payment.paymentIdentifier = paymentMethod.identifier;
    // status is PENDING by default via factory

    const saved = await this.paymentRepo.save(payment);

    await this.events.publishPaymentCreated({
      paymentId: saved.id,
      projectId: dto.projectId,
      specialistId: dto.specialistId,
      amount: dto.amount,
      companyId,
    });

    this.logger.log(`Pagamento de contratação solicitado: ${saved.id} - R$${dto.amount} via ${paymentMethod.type}`);

    return {
      payment: saved,
      paymentMethod: paymentMethod,
    };
  }
}
