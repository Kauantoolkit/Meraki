import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { CreateWithdrawalDto } from '../dto/create-withdrawal.dto';
import { WithdrawalResponseDto } from '../dto/withdrawal-response.dto';
import { IWithdrawalRepository } from '../../domain/repositories/withdrawal.repository.interface';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';
import { Withdrawal } from '../../domain/entities/withdrawal.entity';

@Injectable()
export class RequestWithdrawalUseCase {
  constructor(
    @Inject('IWithdrawalRepository')
    private readonly withdrawalRepository: IWithdrawalRepository,
    @Inject('ISpecialistBalanceRepository')
    private readonly balanceRepository: ISpecialistBalanceRepository,
  ) {}

  async execute(dto: CreateWithdrawalDto): Promise<WithdrawalResponseDto> {
    // Validar dados
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Buscar saldo do especialista
    const balance = await this.balanceRepository.findBySpecialistId(dto.specialistId);
    if (!balance) {
      throw new NotFoundException('Specialist balance not found');
    }

    // Validar saldo disponível
    if (balance.availableBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${balance.availableBalance}`,
      );
    }

    // Validar método de pagamento e dados obrigatórios
    if (dto.paymentMethod === 'PIX' && !dto.pixKey) {
      throw new BadRequestException('PIX key is required for PIX withdrawals');
    }

    if (dto.paymentMethod === 'BANK_TRANSFER' && !dto.bankAccount) {
      throw new BadRequestException('Bank account is required for bank transfers');
    }

    // Criar solicitação de saque
    const withdrawal = new Withdrawal();
    withdrawal.specialistId = dto.specialistId;
    withdrawal.amount = dto.amount;
    withdrawal.paymentMethod = dto.paymentMethod;
    withdrawal.pixKey = dto.pixKey;
    withdrawal.bankAccount = dto.bankAccount;
    withdrawal.status = WithdrawalStatus.PENDING;

    const createdWithdrawal = await this.withdrawalRepository.create(withdrawal);

    return this.mapToDto(createdWithdrawal);
  }

  private mapToDto(withdrawal: Withdrawal): WithdrawalResponseDto {
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
