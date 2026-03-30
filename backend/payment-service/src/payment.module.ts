import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { Payment } from './domain/entities/payment.entity';
import { EscrowAccount } from './domain/entities/escrow-account.entity';

import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

// Repositories (infrastructure — adapters)
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from './infrastructure/repositories/escrow-account.repository';

// Factories (domain)
import { PaymentFactory } from './domain/factories/payment.factory';

// Domain Services
import { FeeCalculationDomainService, FEE_RATE_TOKEN } from './domain/services/fee-calculation.domain-service';

// Use Cases (application)
import { ReleasePaymentUseCase } from './application/use-cases/release-payment.use-case';
import { GetPaymentsUseCase } from './application/use-cases/get-payments.use-case';

// Event Publisher (infrastructure)
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';

// Consumers (infrastructure)
import { MilestoneValidatedConsumer } from './infrastructure/rabbitmq/milestone-validated.consumer';

// Controllers (interfaces)
import { PaymentController } from './interfaces/controllers/payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, EscrowAccount]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [PaymentController],
  providers: [
    JwtStrategy,
    // Repositories
    PaymentRepository,
    EscrowAccountRepository,
    // Factories
    PaymentFactory,
    // Domain Services — taxa injetada pelo módulo, sem process.env no domínio
    {
      provide: FEE_RATE_TOKEN,
      useFactory: () => parseFloat(process.env.PLATFORM_FEE_RATE || '0.10'),
    },
    FeeCalculationDomainService,
    // Event Publisher
    EventPublisherService,
    // Use Cases
    ReleasePaymentUseCase,
    GetPaymentsUseCase,
    // Consumers
    MilestoneValidatedConsumer,
  ],
})
export class PaymentModule {}
