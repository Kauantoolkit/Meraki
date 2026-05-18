import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — Delivery Service',
  description: 'Entregas, Kanban e acompanhamento de progresso',
  port: process.env.PORT || 3004,
  requiredEnvVars: ['JWT_SECRET', 'RABBITMQ_URL', 'DB_USER', 'DB_PASS', 'DB_NAME'],
});
