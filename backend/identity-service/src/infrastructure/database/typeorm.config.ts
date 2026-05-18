import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserSchema } from '../database/schemas/user.schema';
import { SpecialistProfileSchema } from '../database/schemas/specialist-profile.schema';
import { CompanyProfileSchema } from '../database/schemas/company-profile.schema';
import { RefreshTokenSchema } from '../database/schemas/refresh-token.schema';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'identity_db',
  entities: [UserSchema, SpecialistProfileSchema, CompanyProfileSchema, RefreshTokenSchema],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});