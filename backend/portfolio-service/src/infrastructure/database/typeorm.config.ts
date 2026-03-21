import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Portfolio } from '../../domain/entities/portfolio.entity';
import { Certification } from '../../domain/entities/certification.entity';
import { Review } from '../../domain/entities/review.entity';
import { SpecialistPublicProfile } from '../../domain/entities/specialist-public-profile.entity';
import { WorkHistory } from '../../domain/entities/work-history.entity';
import { CompanyPublicProfile } from '../../domain/entities/company-public-profile.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5437'),
  database: process.env.DB_NAME || 'portfolio_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [Portfolio, Certification, Review, SpecialistPublicProfile, WorkHistory, CompanyPublicProfile],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
