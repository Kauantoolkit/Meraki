import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — Bidding Service',
  description: 'Gerenciamento de propostas de especialistas',
  port: process.env.PORT || 3003,
  requiredEnvVars: ['JWT_SECRET', 'RABBITMQ_URL', 'DB_USER', 'DB_PASS', 'DB_NAME'],
});
