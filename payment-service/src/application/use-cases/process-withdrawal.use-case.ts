import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { WithdrawalResponseDto } from '../dto/withdrawal-response.dto';
import { IWithdrawalRepository } from '../../domain/repositories/withdrawal.repository.interface';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';

@Injectable()
export class ProcessWithdrawalUseCase {
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

    if (withdrawal.status !== WithdrawalStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot process withdrawal with status ${withdrawal.status}. Status must be APPROVED`,
      );
    }

    try {
      // Processar pagamento via PIX ou transferência bancária
      await this.processPayment(withdrawal);

      // Atualizar status para PROCESSING
      const processingWithdrawal = await this.withdrawalRepository.update(
        withdrawalId,
        {
          status: WithdrawalStatus.PROCESSING,
        },
      );

      // Simular processamento bem-sucedido
      setTimeout(async () => {
        const balance = await this.balanceRepository.findBySpecialistId(
          withdrawal.specialistId,
        );

        if (balance) {
          await this.balanceRepository.update(withdrawal.specialistId, {
            availableBalance:
              parseFloat(balance.availableBalance.toString()) -
              parseFloat(withdrawal.amount.toString()),
            totalWithdrawn:
              parseFloat(balance.totalWithdrawn.toString()) +
              parseFloat(withdrawal.amount.toString()),
          });
        }

        await this.withdrawalRepository.update(withdrawalId, {
          status: WithdrawalStatus.COMPLETED,
          processedAt: new Date(),
        });
      }, 2000);

      return this.mapToDto(processingWithdrawal);
    } catch (err: any) {
      // Marcar como FAILED se houver erro
      await this.withdrawalRepository.update(withdrawalId, {
        status: WithdrawalStatus.FAILED,
        rejectionReason: err?.message || 'Unknown error',
      });

      throw new BadRequestException(`Failed to process withdrawal: ${err?.message || 'Unknown error'}`);
    }
  }

  private async processPayment(withdrawal: any): Promise<void> {
    // Simulação de processamento de pagamento
    if (withdrawal.paymentMethod === 'PIX') {
      // Integrar com API PIX em produção
      console.log(
        `Processing PIX payment to ${withdrawal.pixKey} for amount R$ ${withdrawal.amount}`,
      );
    } else if (withdrawal.paymentMethod === 'BANK_TRANSFER') {
      // Integrar com API bancária em produção
      console.log(
        `Processing bank transfer to ${withdrawal.bankAccount} for amount R$ ${withdrawal.amount}`,
      );
    }
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
