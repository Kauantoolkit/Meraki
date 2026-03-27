import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './domain/entities/payment.entity';
import { Withdrawal } from './domain/entities/withdrawal.entity';
import { SpecialistBalance } from './domain/entities/specialist-balance.entity';

// Repositories
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { WithdrawalRepository } from './infrastructure/repositories/withdrawal.repository';
import { SpecialistBalanceRepository } from './infrastructure/repositories/specialist-balance.repository';

// Use Cases
import { CreatePaymentHiringUseCase } from './application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentHiringUseCase } from './application/use-cases/confirm-payment-hiring.use-case';
import { RequestWithdrawalUseCase } from './application/use-cases/request-withdrawal.use-case';
import { ApproveWithdrawalUseCase } from './application/use-cases/approve-withdrawal.use-case';
import { ProcessWithdrawalUseCase } from './application/use-cases/process-withdrawal.use-case';
import { GetSpecialistBalanceUseCase } from './application/use-cases/get-specialist-balance.use-case';

// Controllers
import { PaymentHiringController } from './interfaces/controllers/payment-hiring.controller';
import { WithdrawalController } from './interfaces/controllers/withdrawal.controller';

// Interfaces
import { IPaymentRepository } from './domain/repositories/payment.repository.interface';
import { IWithdrawalRepository } from './domain/repositories/withdrawal.repository.interface';
import { ISpecialistBalanceRepository } from './domain/repositories/specialist-balance.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Withdrawal, SpecialistBalance]),
  ],
  controllers: [PaymentHiringController, WithdrawalController],
  providers: [
    // Repositories
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    {
      provide: 'IWithdrawalRepository',
      useClass: WithdrawalRepository,
    },
    {
      provide: 'ISpecialistBalanceRepository',
      useClass: SpecialistBalanceRepository,
    },
    // Use Cases
    CreatePaymentHiringUseCase,
    ConfirmPaymentHiringUseCase,
    RequestWithdrawalUseCase,
    ApproveWithdrawalUseCase,
    ProcessWithdrawalUseCase,
    GetSpecialistBalanceUseCase,
  ],
  exports: [
    'IPaymentRepository',
    'IWithdrawalRepository',
    'ISpecialistBalanceRepository',
    CreatePaymentHiringUseCase,
    ConfirmPaymentHiringUseCase,
    RequestWithdrawalUseCase,
    ApproveWithdrawalUseCase,
    ProcessWithdrawalUseCase,
    GetSpecialistBalanceUseCase,
  ],
})
export class PaymentModule {}
