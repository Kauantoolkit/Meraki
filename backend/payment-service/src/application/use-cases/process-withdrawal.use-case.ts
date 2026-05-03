import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WithdrawalRepository } from '../../infrastructure/repositories/withdrawal.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';

@Injectable()
export class ProcessWithdrawalUseCase {
  private readonly logger = new Logger(ProcessWithdrawalUseCase.name);

  constructor(
    private readonly withdrawalRepo: WithdrawalRepository,
    private readonly balanceRepo: SpecialistBalanceRepository,
    private readonly events: EventPublisherService,
  ) {}

  async execute(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Saque não encontrado');

    const balance = await this.balanceRepo.findBySpecialist(withdrawal.specialistId);
    if (!balance || !balance.hasSufficientBalance(withdrawal.amount)) {
      throw new DomainException('Saldo insuficiente no momento do processamento');
    }

    withdrawal.startProcessing();

    // Debita do saldo
    balance.debit(withdrawal.amount);
    await this.balanceRepo.save(balance);

    // Simula processamento (em produção seria integração com gateway)
    withdrawal.complete();
    await this.withdrawalRepo.save(withdrawal);

    await this.events.publishWithdrawalCompleted({
      withdrawalId: withdrawal.id,
      specialistId: withdrawal.specialistId,
      amount: withdrawal.amount,
      method: withdrawal.method,
    });

    this.logger.log(`Saque ${withdrawalId} processado: R$${withdrawal.amount}`);

    return withdrawal;
  }
}
