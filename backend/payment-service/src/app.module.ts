import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { PaymentModule } from './payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    SharedModule,
    PaymentModule,
  ],
})
export class AppModule {}
