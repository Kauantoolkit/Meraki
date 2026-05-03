import { Injectable, Logger } from '@nestjs/common';
import { PaymentFactory } from '../../domain/factories/payment.factory';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { CreatePaymentHiringDto } from '../dto/create-payment-hiring.dto';

@Injectable()
export class CreatePaymentHiringUseCase {
  private readonly logger = new Logger(CreatePaymentHiringUseCase.name);

  constructor(
    private readonly paymentFactory: PaymentFactory,
    private readonly paymentRepo: PaymentRepository,
    private readonly balanceRepo: SpecialistBalanceRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(dto: CreatePaymentHiringDto, companyId: string) {
    const payment = this.paymentFactory.create({
      milestoneId: dto.milestoneId || `hiring-${Date.now()}`,
      projectId: dto.projectId,
      specialistId: dto.specialistId,
      amount: dto.amount,
    });

    const saved = await this.paymentRepo.save(payment);

    await this.events.publishPaymentCreated({
      paymentId: saved.id,
      projectId: dto.projectId,
      specialistId: dto.specialistId,
      amount: dto.amount,
      companyId,
    });

    this.logger.log(`Pagamento de contratação criado: ${saved.id} - R$${dto.amount}`);

    return saved;
  }
}
