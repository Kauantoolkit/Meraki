import { EntitySchema } from 'typeorm';
import { Withdrawal } from '../../../domain/entities/withdrawal.entity';
import { WithdrawalStatus } from '../../../domain/enums/withdrawal-status.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

export const WithdrawalSchema = new EntitySchema<Withdrawal>({
  name: 'Withdrawal',
  target: Withdrawal,
  tableName: 'withdrawals',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar' },
    amount: { type: 'decimal', precision: 10, scale: 2 },
    method: { type: 'enum', enum: PaymentMethod, default: PaymentMethod.PIX },
    pixKey: { type: 'varchar', nullable: true },
    bankDetails: { type: 'varchar', nullable: true },
    status: { type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING },
    processedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
