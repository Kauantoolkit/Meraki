import { Injectable, NotFoundException } from '@nestjs/common';
import { SpecialistBalanceRepository } from '../../infrastructure/repositories/specialist-balance.repository';

@Injectable()
export class GetSpecialistBalanceUseCase {
  constructor(private readonly balanceRepo: SpecialistBalanceRepository) {}

  async execute(specialistId: string) {
    const balance = await this.balanceRepo.findBySpecialist(specialistId);
    if (!balance) throw new NotFoundException('Saldo não encontrado para este especialista');
    return balance;
  }
}
