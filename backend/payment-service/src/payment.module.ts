import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { Payment } from './domain/entities/payment.entity';
import { EscrowAccount } from './domain/entities/escrow-account.entity';
import { Withdrawal } from './domain/entities/withdrawal.entity';
import { SpecialistBalance } from './domain/entities/specialist-balance.entity';

import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

// Repositories (infrastructure — adapters)
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from './infrastructure/repositories/escrow-account.repository';
import { WithdrawalRepository } from './infrastructure/repositories/withdrawal.repository';
import { SpecialistBalanceRepository } from './infrastructure/repositories/specialist-balance.repository';

// Factories (domain)
import { PaymentFactory } from './domain/factories/payment.factory';

// Domain Services
import { FeeCalculationDomainService } from './domain/services/fee-calculation.domain-service';

// Use Cases (application)
import { ReleasePaymentUseCase } from './application/use-cases/release-payment.use-case';
import { GetPaymentsUseCase } from './application/use-cases/get-payments.use-case';
import { CreatePaymentHiringUseCase } from './application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case';
import { RequestWithdrawalUseCase } from './application/use-cases/request-withdrawal.use-case';
import { ApproveWithdrawalUseCase } from './application/use-cases/approve-withdrawal.use-case';
import { ProcessWithdrawalUseCase } from './application/use-cases/process-withdrawal.use-case';
import { GetSpecialistBalanceUseCase } from './application/use-cases/get-specialist-balance.use-case';

// Event Publisher (infrastructure)
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';

// Consumers (infrastructure)
import { MilestoneValidatedConsumer } from './infrastructure/rabbitmq/milestone-validated.consumer';
import { DeliveryEventConsumer } from './infrastructure/rabbitmq/delivery-event.consumer';

// Controllers (interfaces)
import { PaymentController } from './interfaces/controllers/payment.controller';
import { PaymentHiringController } from './interfaces/controllers/payment-hiring.controller';
import { WithdrawalController } from './interfaces/controllers/withdrawal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, EscrowAccount, Withdrawal, SpecialistBalance]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [PaymentController, PaymentHiringController, WithdrawalController],
  providers: [
    JwtStrategy,
    // Repositories
    PaymentRepository,
    EscrowAccountRepository,
    WithdrawalRepository,
    SpecialistBalanceRepository,
    // Domain Factories (instanciadas sem @Injectable — domain puro)
    { provide: PaymentFactory, useFactory: () => new PaymentFactory() },
    // Domain Services — taxa injetada pelo módulo, domain livre de NestJS
    {
      provide: FeeCalculationDomainService,
      useFactory: () => new FeeCalculationDomainService(
        parseFloat(process.env.PLATFORM_FEE_RATE || '0.10'),
      ),
    },
    // Event Publisher
    EventPublisherService,
    // Use Cases
    ReleasePaymentUseCase,
    GetPaymentsUseCase,
    CreatePaymentHiringUseCase,
    ConfirmPaymentUseCase,
    RequestWithdrawalUseCase,
    ApproveWithdrawalUseCase,
    ProcessWithdrawalUseCase,
    GetSpecialistBalanceUseCase,
    // Consumers
    MilestoneValidatedConsumer,
    DeliveryEventConsumer,
  ],
})
export class PaymentModule {}
