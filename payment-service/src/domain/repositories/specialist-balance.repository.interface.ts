import { SpecialistBalance } from '../entities/specialist-balance.entity';

export interface ISpecialistBalanceRepository {
  findBySpecialistId(specialistId: string): Promise<SpecialistBalance | null>;
  create(balance: Partial<SpecialistBalance>): Promise<SpecialistBalance>;
  update(specialistId: string, balance: Partial<SpecialistBalance>): Promise<SpecialistBalance | null>;
}
