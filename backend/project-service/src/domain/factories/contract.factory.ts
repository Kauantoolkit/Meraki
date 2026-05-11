import { Contract } from '../entities/contract.entity';
import { ContractStatus } from '../enums/contract-status.enum';
import { ContractType } from '../enums/contract-type.enum';
import { DomainException } from '../exceptions/domain.exception';

export interface CreateContractData {
  projectId: string;
  milestoneId?: string;
  type: ContractType;
  title: string;
  content: string;
}

export class ContractFactory {
  create(data: CreateContractData): Contract {
    if (!data.projectId) throw new DomainException('projectId é obrigatório');
    if (!data.type) throw new DomainException('type é obrigatório');
    if (!data.title || !data.title.trim()) throw new DomainException('title é obrigatório');
    if (!data.content || !data.content.trim()) throw new DomainException('content é obrigatório');

    const contract = new Contract();
    contract.projectId = data.projectId;
    contract.milestoneId = data.milestoneId;
    contract.type = data.type;
    contract.title = data.title.trim();
    contract.content = data.content.trim();
    contract.status = ContractStatus.FINALIZED;
    contract.createdAt = new Date();
    contract.finalizedAt = new Date();

    return contract;
  }
}
