import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { ProjectModule } from './project.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    RabbitMQModule,
    ProjectModule,
  ],
})
export class AppModule {}
