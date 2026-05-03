import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialistBalance } from '../../domain/entities/specialist-balance.entity';
import { ISpecialistBalanceRepository } from '../../domain/repositories/i-specialist-balance.repository';

@Injectable()
export class SpecialistBalanceRepository implements ISpecialistBalanceRepository {
  constructor(
    @InjectRepository(SpecialistBalance)
    private readonly repo: Repository<SpecialistBalance>,
  ) {}

  save(balance: SpecialistBalance): Promise<SpecialistBalance> {
    return this.repo.save(balance);
  }

  findBySpecialist(specialistId: string): Promise<SpecialistBalance | null> {
    return this.repo.findOne({ where: { specialistId } });
  }
}
