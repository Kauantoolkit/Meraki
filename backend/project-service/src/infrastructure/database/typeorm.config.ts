import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProjectSchema } from './schemas/project.schema';
import { MilestoneSchema } from './schemas/milestone.schema';
import { ProjectHistorySchema } from './schemas/project-history.schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'project_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [ProjectSchema, MilestoneSchema, ProjectHistorySchema],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});