import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSchema } from './infrastructure/database/schemas/notification.schema';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { NotificationConsumer } from './infrastructure/rabbitmq/consumers/notification.consumer';
import { NotificationController } from './interfaces/controllers/notification.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'messaging_db',
      entities: [NotificationSchema],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([NotificationSchema]),
    RabbitMQModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationRepository, NotificationConsumer],
})
export class AppModule {}
