import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BidSchema } from './schemas/bid.schema';
import { BidMessageSchema } from './schemas/bid-message.schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bidding_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [BidSchema, BidMessageSchema],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
