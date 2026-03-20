import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './interfaces/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefixo global de rotas
  app.setGlobalPrefix('api');

  // Validação automática dos DTOs via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Rejeita requests com campos extras
      transform: true,          // Transforma tipos automaticamente
    }),
  );

  // Filtro global de exceções HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS liberado para desenvolvimento
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MERAKI — Identity Service')
    .setDescription(
      'Identity & Access Context: registro, autenticação e gerenciamento de perfis',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`Identity Service rodando em http://localhost:${port}`);
  logger.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
