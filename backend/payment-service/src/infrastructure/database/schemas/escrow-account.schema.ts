import { EntitySchema } from 'typeorm';
import { EscrowAccount, EscrowStatus } from '../../../domain/entities/escrow-account.entity';

export const EscrowAccountSchema = new EntitySchema<EscrowAccount>({
  name: 'EscrowAccount',
  target: EscrowAccount,
  tableName: 'escrow_accounts',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'varchar', unique: true },
    totalAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    heldAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    releasedAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    status: { type: 'enum', enum: EscrowStatus, default: EscrowStatus.OPEN },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
