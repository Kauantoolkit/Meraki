import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Project } from '../../domain/entities/project.entity';
import { Milestone } from '../../domain/entities/milestone.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'project_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [Project, Milestone],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
