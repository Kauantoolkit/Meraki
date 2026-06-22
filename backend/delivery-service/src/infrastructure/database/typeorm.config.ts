import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DeliverySchema } from './schemas/delivery.schema';
import { KanbanColumnSchema } from './schemas/kanban-column.schema';
import { KanbanCardSchema } from './schemas/kanban-card.schema';
import { ProjectHistorySchema } from './schemas/project-history.schema';
import { MilestoneCommentSchema } from './schemas/milestone-comment.schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'delivery_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [DeliverySchema, KanbanColumnSchema, KanbanCardSchema, ProjectHistorySchema, MilestoneCommentSchema],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
