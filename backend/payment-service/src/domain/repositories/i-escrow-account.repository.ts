import { EscrowAccount } from '../entities/escrow-account.entity';

export interface IEscrowAccountRepository {
  findByProject(projectId: string): Promise<EscrowAccount | null>;
  save(escrow: EscrowAccount): Promise<EscrowAccount>;
}
