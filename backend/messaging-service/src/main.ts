import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@shared/infra/filters/http-exception.filter';
import { DomainExceptionFilter } from '@shared/infra/filters/domain-exception.filter';

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis obrigatórias não configuradas: ${missing.join(', ')}`);
}

async function bootstrap() {
  requireEnv(['JWT_SECRET', 'DB_USER', 'DB_PASS', 'DB_NAME']);

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // WebSocket adapter — socket.io on same port as HTTP
  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(), new DomainExceptionFilter());
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('MERAKI — Messaging Service')
    .setDescription('Chat em tempo real via WebSocket + histórico via REST')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3007;
  await app.listen(port);

  logger.log(`Messaging Service rodando em http://localhost:${port}`);
  logger.log(`Swagger disponível em http://localhost:${port}/api/docs`);
  logger.log(`WebSocket: ws://localhost:${port} (socket.io)`);
}

bootstrap();
