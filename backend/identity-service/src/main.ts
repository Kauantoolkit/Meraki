import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — Identity Service',
  description: 'Identity & Access Context: registro, autenticação e gerenciamento de perfis',
  port: process.env.PORT || 3001,
  requiredEnvVars: [
    'JWT_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'RABBITMQ_URL',
    'DB_USER',
    'DB_PASS',
    'DB_NAME',
  ],
});
