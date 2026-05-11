import { Contract } from '../entities/contract.entity';

export const CONTRACT_REPOSITORY = 'CONTRACT_REPOSITORY';

export interface IContractRepository {
  save(contract: Contract): Promise<Contract>;
  findByProject(projectId: string): Promise<Contract[]>;
  findByMilestone(milestoneId: string): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
}
