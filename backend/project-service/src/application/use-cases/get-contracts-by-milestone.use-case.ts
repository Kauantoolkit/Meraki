import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../infrastructure/repositories/contract.repository';

@Injectable()
export class GetContractsByMilestoneUseCase {
  constructor(private readonly contractRepo: ContractRepository) {}

  execute(milestoneId: string) {
    return this.contractRepo.findByMilestone(milestoneId);
  }
}
