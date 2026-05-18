import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — Payment Service',
  description: 'Pagamentos, escrow e taxas da plataforma',
  port: process.env.PORT || 3005,
  requiredEnvVars: ['JWT_SECRET', 'RABBITMQ_URL', 'DB_USER', 'DB_PASS', 'DB_NAME'],
});
