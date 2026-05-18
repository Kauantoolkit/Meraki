import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapHttpApp } from '@shared/infra/http/bootstrap-http-app';
import { AppModule } from './app.module';

bootstrapHttpApp(AppModule, {
  title: 'MERAKI — API Gateway',
  description: 'Gateway de entrada: roteamento, JWT e rate limiting',
  port: process.env.PORT || 3000,
  requiredEnvVars: ['JWT_SECRET'],
});
