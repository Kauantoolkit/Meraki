import { Injectable, Logger } from '@nestjs/common';
import { WithdrawalRepository } from '../../infrastructure/repositories/withdrawal.repository';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';
import { Withdrawal } from '../../domain/entities/withdrawal.entity';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { CreateWithdrawalDto } from '../dto/create-withdrawal.dto';

@Injectable()
export class RequestWithdrawalUseCase {
  private readonly logger = new Logger(RequestWithdrawalUseCase.name);

  constructor(
    private readonly withdrawalRepo: WithdrawalRepository,
    private readonly balanceRepo: SpecialistBalanceRepository,
  ) {}

  async execute(dto: CreateWithdrawalDto, specialistId: string) {
    const balance = await this.balanceRepo.findBySpecialist(specialistId);
    if (!balance || !balance.hasSufficientBalance(dto.amount)) {
      throw new DomainException('Saldo insuficiente para saque');
    }

    const withdrawal = new Withdrawal();
    withdrawal.specialistId = specialistId;
    withdrawal.amount = dto.amount;
    withdrawal.method = dto.method;
    withdrawal.pixKey = dto.pixKey;
    withdrawal.bankDetails = dto.bankDetails;
    withdrawal.status = WithdrawalStatus.PENDING;

    withdrawal.validatePixKey();

    const saved = await this.withdrawalRepo.save(withdrawal);

    this.logger.log(`Saque solicitado: ${saved.id} - R$${dto.amount} via ${dto.method}`);

    return saved;
  }
}
