import { EntitySchema } from 'typeorm';
import { Bid } from '../../../domain/entities/bid.entity';
import { BidStatus } from '../../../domain/enums/bid-status.enum';

export const BidSchema = new EntitySchema<Bid>({
  name: 'Bid',
  target: Bid,
  tableName: 'bids',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: String },
    specialistId: { type: String },
    proposal: { type: 'text' },
    proposedBudget: { type: 'decimal', precision: 10, scale: 2 },
    estimatedDuration: { type: Number },
    status: { type: 'enum', enum: BidStatus, default: BidStatus.PENDING },
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true },
  },
  relations: {
    messages: {
      type: 'one-to-many',
      target: 'BidMessage',
      inverseSide: 'bid',
      cascade: true,
    },
  },
});
