import { EntitySchema } from 'typeorm';
import { Payment, PaymentStatus } from '../../../domain/entities/payment.entity';

export const PaymentSchema = new EntitySchema<Payment>({
  name: 'Payment',
  target: Payment,
  tableName: 'payments',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'varchar' },
    milestoneId: { type: 'varchar' },
    specialistId: { type: 'varchar' },
    amount: { type: 'decimal', precision: 10, scale: 2 },
    specialistAmount: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    platformFee: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    status: { type: 'enum', enum: PaymentStatus, default: PaymentStatus.ESCROW_HELD },
    escrowTransactionId: { type: 'varchar', nullable: true },
    releaseTransactionId: { type: 'varchar', nullable: true },
    releasedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
