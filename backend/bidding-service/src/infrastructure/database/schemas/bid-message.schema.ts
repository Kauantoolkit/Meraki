import { EntitySchema } from 'typeorm';
import { BidMessage } from '../../../domain/entities/bid-message.entity';

export const BidMessageSchema = new EntitySchema<BidMessage>({
  name: 'BidMessage',
  target: BidMessage,
  tableName: 'bid_messages',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    bidId: { type: String },
    senderId: { type: String },
    content: { type: 'text' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, createDate: true },
  },
});
