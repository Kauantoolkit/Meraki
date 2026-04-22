import { EntitySchema } from 'typeorm';
import { Conversation } from '../../../domain/entities/conversation.entity';

export const ConversationSchema = new EntitySchema<Conversation>({
  name: 'Conversation',
  target: Conversation,
  tableName: 'conversations',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    participantIds: { type: 'simple-array' },
    lastMessage: { type: 'varchar', nullable: true },
    lastMessageAt: { type: 'timestamptz', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
