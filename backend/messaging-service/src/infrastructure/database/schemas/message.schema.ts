import { EntitySchema } from 'typeorm';
import { Message } from '../../../domain/entities/message.entity';

export const MessageSchema = new EntitySchema<Message>({
  name: 'Message',
  target: Message,
  tableName: 'messages',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    conversationId: { type: 'varchar' },
    senderId: { type: 'varchar' },
    senderName: { type: 'varchar' },
    text: { type: 'text' },
    createdAt: { type: 'timestamp', createDate: true },
  },
});
