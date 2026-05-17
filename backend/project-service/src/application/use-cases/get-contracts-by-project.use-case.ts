import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../infrastructure/repositories/contract.repository';

@Injectable()
export class GetContractsByProjectUseCase {
  constructor(private readonly contractRepo: ContractRepository) {}

  execute(projectId: string) {
    return this.contractRepo.findByProject(projectId);
  }
}
