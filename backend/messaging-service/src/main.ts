import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './interfaces/filters/http-exception.filter';

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis obrigatórias não configuradas: ${missing.join(', ')}`);
}

async function bootstrap() {
  requireEnv(['JWT_SECRET', 'DB_USER', 'DB_PASS', 'DB_NAME']);

  const app = await NestFactory.create(AppModule);

  // WebSocket adapter — socket.io on same port as HTTP
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

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
  console.log(`Messaging Service rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
  console.log(`WebSocket: ws://localhost:${port} (socket.io, namespace /)`);
}

bootstrap();
