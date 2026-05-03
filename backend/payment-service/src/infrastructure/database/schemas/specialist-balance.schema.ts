import { EntitySchema } from 'typeorm';
import { SpecialistBalance } from '../../../domain/entities/specialist-balance.entity';

export const SpecialistBalanceSchema = new EntitySchema<SpecialistBalance>({
  name: 'SpecialistBalance',
  target: SpecialistBalance,
  tableName: 'specialist_balances',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar', unique: true },
    totalEarned: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    availableBalance: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    totalWithdrawn: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
