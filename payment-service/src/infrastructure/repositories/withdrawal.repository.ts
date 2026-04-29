import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from '../../domain/entities/withdrawal.entity';
import { IWithdrawalRepository } from '../../domain/repositories/withdrawal.repository.interface';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';

@Injectable()
export class WithdrawalRepository implements IWithdrawalRepository {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly repository: Repository<Withdrawal>,
  ) {}

  async findById(id: string): Promise<Withdrawal | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySpecialistId(specialistId: string): Promise<Withdrawal[]> {
    return this.repository.find({ where: { specialistId } });
  }

  async findByStatus(status: WithdrawalStatus): Promise<Withdrawal[]> {
    return this.repository.find({ where: { status } });
  }

  async create(withdrawal: Partial<Withdrawal>): Promise<Withdrawal> {
    const newWithdrawal = this.repository.create(withdrawal);
    return this.repository.save(newWithdrawal);
  }

  async update(id: string, withdrawal: Partial<Withdrawal>): Promise<Withdrawal | null> {
    await this.repository.update(id, withdrawal);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
