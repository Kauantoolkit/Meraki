import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — Project Service',
  description: 'Gerenciamento de projetos e milestones',
  port: process.env.PORT || 3002,
  requiredEnvVars: ['JWT_SECRET', 'RABBITMQ_URL', 'DB_USER', 'DB_PASS', 'DB_NAME'],
});
