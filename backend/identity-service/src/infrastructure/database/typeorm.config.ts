import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { SpecialistProfile } from '../../domain/entities/specialist-profile.entity';
import { CompanyProfile } from '../../domain/entities/company-profile.entity';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'identity_db',
  entities: [User, SpecialistProfile, CompanyProfile],
  // synchronize: true apenas em desenvolvimento — cria/atualiza tabelas automaticamente
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
