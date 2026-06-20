import { EntitySchema } from 'typeorm';
import { Notification } from '../../../domain/entities/notification.entity';

export const NotificationSchema = new EntitySchema<Notification>({
  name: 'Notification',
  target: Notification,
  tableName: 'notifications',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
    },
    type: {
      type: 'varchar',
    },
    title: {
      type: 'varchar',
    },
    message: {
      type: 'varchar',
    },
    read: {
      type: 'boolean',
      default: false,
    },
    metadata: {
      type: 'jsonb',
      default: {},
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  indices: [
    {
      name: 'IDX_notification_userId',
      columns: ['userId'],
    },
  ],
});
