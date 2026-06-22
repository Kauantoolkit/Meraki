import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PortfolioSchema } from './schemas/portfolio.schema';
import { CertificationSchema } from './schemas/certification.schema';
import { ReviewSchema } from './schemas/review.schema';
import { SpecialistPublicProfileSchema } from './schemas/specialist-public-profile.schema';
import { WorkHistorySchema } from './schemas/work-history.schema';
import { CompanyPublicProfileSchema } from './schemas/company-public-profile.schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portfolio_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [PortfolioSchema, CertificationSchema, ReviewSchema, SpecialistPublicProfileSchema, WorkHistorySchema, CompanyPublicProfileSchema],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
