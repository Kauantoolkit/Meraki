import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { WithdrawalResponseDto } from '../dto/withdrawal-response.dto';
import { IWithdrawalRepository } from '../../domain/repositories/withdrawal.repository.interface';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';

@Injectable()
export class ApproveWithdrawalUseCase {
  constructor(
    @Inject('IWithdrawalRepository')
    private readonly withdrawalRepository: IWithdrawalRepository,
    @Inject('ISpecialistBalanceRepository')
    private readonly balanceRepository: ISpecialistBalanceRepository,
  ) {}

  async execute(withdrawalId: string): Promise<WithdrawalResponseDto> {
    const withdrawal = await this.withdrawalRepository.findById(withdrawalId);

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve withdrawal with status ${withdrawal.status}`,
      );
    }

    // Atualizar status para APPROVED
    const updatedWithdrawal = await this.withdrawalRepository.update(withdrawalId, {
      status: WithdrawalStatus.APPROVED,
      approvedAt: new Date(),
    });

    return this.mapToDto(updatedWithdrawal);
  }

  private mapToDto(withdrawal: any): WithdrawalResponseDto {
    return {
      id: withdrawal.id,
      specialistId: withdrawal.specialistId,
      amount: withdrawal.amount,
      paymentMethod: withdrawal.paymentMethod,
      pixKey: withdrawal.pixKey,
      bankAccount: withdrawal.bankAccount,
      status: withdrawal.status,
      approvedAt: withdrawal.approvedAt,
      processedAt: withdrawal.processedAt,
      rejectionReason: withdrawal.rejectionReason,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
    };
  }
}
