import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis obrigatórias não configuradas: ${missing.join(', ')}`);
}

async function bootstrap() {
  requireEnv([
    'JWT_SECRET',
    'IDENTITY_SERVICE_URL',
    'PROJECT_SERVICE_URL',
    'BIDDING_SERVICE_URL',
    'DELIVERY_SERVICE_URL',
    'PAYMENT_SERVICE_URL',
    'PORTFOLIO_SERVICE_URL',
  ]);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('MERAKI API Gateway')
    .setDescription('Ponto de entrada unificado da plataforma MERAKI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
