import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';

@Injectable()
export class SpecialistBalanceRepository implements ISpecialistBalanceRepository {
  constructor(
    @InjectRepository(SpecialistBalance)
    private readonly repository: Repository<SpecialistBalance>,
  ) {}

  async findBySpecialistId(specialistId: string): Promise<SpecialistBalance | null> {
    return this.repository.findOne({ where: { specialistId } });
  }

  async create(balance: Partial<SpecialistBalance>): Promise<SpecialistBalance> {
    const newBalance = this.repository.create(balance);
    return this.repository.save(newBalance);
  }

  async update(
    specialistId: string,
    balance: Partial<SpecialistBalance>,
  ): Promise<SpecialistBalance | null> {
    await this.repository.update({ specialistId }, balance);
    return this.repository.findOne({ where: { specialistId } });
  }
}
