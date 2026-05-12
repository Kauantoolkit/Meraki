import { EntitySchema } from 'typeorm';
import { Contract } from '../../../domain/entities/contract.entity';
import { ContractType } from '../../../domain/enums/contract-type.enum';
import { ContractStatus } from '../../../domain/enums/contract-status.enum';

export const ContractSchema = new EntitySchema<Contract>({
  name: 'Contract',
  target: Contract,
  tableName: 'contracts',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: String },
    milestoneId: { type: String, nullable: true },
    type: { type: 'enum', enum: ContractType },
    title: { type: String },
    content: { type: 'text' },
    status: { type: 'enum', enum: ContractStatus, default: ContractStatus.FINALIZED },
    createdAt: { type: Date, createDate: true },
    finalizedAt: { type: 'timestamp', nullable: true },
  },
});
