import { ContractStatus } from '../enums/contract-status.enum';
import { ContractType } from '../enums/contract-type.enum';

export class Contract {
  id: string;
  projectId: string;
  milestoneId?: string;
  type: ContractType;
  title: string;
  content: string;
  status: ContractStatus;
  createdAt: Date;
  finalizedAt: Date;

  finalize(): void {
    if (this.status !== ContractStatus.DRAFT) {
      return;
    }
    this.status = ContractStatus.FINALIZED;
    this.finalizedAt = new Date();
  }
}
