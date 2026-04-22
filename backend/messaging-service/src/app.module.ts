import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { MessagingModule } from './messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    MessagingModule,
  ],
})
export class AppModule {}
