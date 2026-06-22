import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PaymentSchema } from './schemas/payment.schema';
import { EscrowAccountSchema } from './schemas/escrow-account.schema';
import { WithdrawalSchema } from './schemas/withdrawal.schema';
import { SpecialistBalanceSchema } from './schemas/specialist-balance.schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'payment_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [PaymentSchema, EscrowAccountSchema, WithdrawalSchema, SpecialistBalanceSchema],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
