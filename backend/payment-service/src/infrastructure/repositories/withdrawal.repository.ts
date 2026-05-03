import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from '../../domain/entities/withdrawal.entity';
import { IWithdrawalRepository } from '../../domain/repositories/i-withdrawal.repository';

@Injectable()
export class WithdrawalRepository implements IWithdrawalRepository {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly repo: Repository<Withdrawal>,
  ) {}

  save(withdrawal: Withdrawal): Promise<Withdrawal> {
    return this.repo.save(withdrawal);
  }

  findById(id: string): Promise<Withdrawal | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySpecialist(specialistId: string): Promise<Withdrawal[]> {
    return this.repo.find({ where: { specialistId }, order: { createdAt: 'DESC' } });
  }

  findByStatus(status: string): Promise<Withdrawal[]> {
    return this.repo.find({ where: { status: status as any }, order: { createdAt: 'DESC' } });
  }
}
