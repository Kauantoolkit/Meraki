import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';

export class SpecialistBalanceDto {
  specialistId!: string;
  totalEarned!: number;
  availableBalance!: number;
  totalWithdrawn!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

@Injectable()
export class GetSpecialistBalanceUseCase {
  constructor(
    @Inject('ISpecialistBalanceRepository')
    private readonly balanceRepository: ISpecialistBalanceRepository,
  ) {}

  async execute(specialistId: string): Promise<SpecialistBalanceDto> {
    const balance = await this.balanceRepository.findBySpecialistId(specialistId);

    if (!balance) {
      throw new NotFoundException('Specialist balance not found');
    }

    return {
      specialistId: balance.specialistId,
      totalEarned: parseFloat(balance.totalEarned.toString()),
      availableBalance: parseFloat(balance.availableBalance.toString()),
      totalWithdrawn: parseFloat(balance.totalWithdrawn.toString()),
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt,
    };
  }
}
