import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Delivery } from '../../domain/entities/delivery.entity';
import { KanbanColumn } from '../../domain/entities/kanban-column.entity';
import { KanbanCard } from '../../domain/entities/kanban-card.entity';
import { ProjectHistory } from '../../domain/entities/project-history.entity';
import { MilestoneComment } from '../../domain/entities/milestone-comment.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5435'),
  database: process.env.DB_NAME || 'delivery_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [Delivery, KanbanColumn, KanbanCard, ProjectHistory, MilestoneComment],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
