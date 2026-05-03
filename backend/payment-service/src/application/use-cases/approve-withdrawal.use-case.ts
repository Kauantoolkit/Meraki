import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WithdrawalRepository } from '../../infrastructure/repositories/withdrawal.repository';

@Injectable()
export class ApproveWithdrawalUseCase {
  private readonly logger = new Logger(ApproveWithdrawalUseCase.name);

  constructor(private readonly withdrawalRepo: WithdrawalRepository) {}

  async execute(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Saque não encontrado');

    withdrawal.approve();
    const saved = await this.withdrawalRepo.save(withdrawal);

    this.logger.log(`Saque ${withdrawalId} aprovado`);

    return saved;
  }
}
