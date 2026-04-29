import { Withdrawal } from '../entities/withdrawal.entity';
import { WithdrawalStatus } from '../enums/withdrawal-status.enum';

export interface IWithdrawalRepository {
  findById(id: string): Promise<Withdrawal | null>;
  findBySpecialistId(specialistId: string): Promise<Withdrawal[]>;
  findByStatus(status: WithdrawalStatus): Promise<Withdrawal[]>;
  create(withdrawal: Partial<Withdrawal>): Promise<Withdrawal>;
  update(id: string, withdrawal: Partial<Withdrawal>): Promise<Withdrawal | null>;
  delete(id: string): Promise<void>;
}
