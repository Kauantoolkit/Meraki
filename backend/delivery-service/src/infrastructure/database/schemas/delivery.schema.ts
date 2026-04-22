import { EntitySchema } from 'typeorm';
import { Delivery, DeliveryStatus } from '../../../domain/entities/delivery.entity';

export const DeliverySchema = new EntitySchema<Delivery>({
  name: 'Delivery',
  target: Delivery,
  tableName: 'deliveries',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    milestoneId: { type: 'varchar' },
    projectId: { type: 'varchar' },
    specialistId: { type: 'varchar' },
    status: { type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING },
    deliveredFiles: { type: 'simple-array', nullable: true },
    deliveryNotes: { type: 'text', nullable: true },
    rejectionReason: { type: 'text', nullable: true },
    submittedAt: { type: 'timestamp', nullable: true },
    reviewedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
