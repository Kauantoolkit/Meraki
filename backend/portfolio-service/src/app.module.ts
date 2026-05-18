import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { PortfolioModule } from './portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    SharedModule,
    PortfolioModule,
  ],
})
export class AppModule {}
