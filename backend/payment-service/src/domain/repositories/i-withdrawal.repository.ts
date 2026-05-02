import { Withdrawal } from '../entities/withdrawal.entity';

export interface IWithdrawalRepository {
  save(withdrawal: Withdrawal): Promise<Withdrawal>;
  findById(id: string): Promise<Withdrawal | null>;
  findBySpecialist(specialistId: string): Promise<Withdrawal[]>;
  findByStatus(status: string): Promise<Withdrawal[]>;
}
