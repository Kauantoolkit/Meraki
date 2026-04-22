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
    message: { type: 'text' },
    createdAt: { type: Date, createDate: true },
  },
  relations: {
    bid: {
      type: 'many-to-one',
      target: 'Bid',
      inverseSide: 'messages',
      joinColumn: { name: 'bidId' },
      onDelete: 'CASCADE',
    },
  },
});
