import { SpecialistBalance } from '../entities/specialist-balance.entity';

export interface ISpecialistBalanceRepository {
  save(balance: SpecialistBalance): Promise<SpecialistBalance>;
  findBySpecialist(specialistId: string): Promise<SpecialistBalance | null>;
}
