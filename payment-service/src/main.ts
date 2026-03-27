import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MERAKI Payment Service API')
    .setDescription('System for managing payments and withdrawals via PIX')
    .setVersion('1.0')
    .addTag('Payments - Hiring', 'Payment operations for hiring specialists')
    .addTag('Withdrawals', 'Withdrawal operations for specialists')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002, () => {
    console.log('🚀 Payment Service running on http://localhost:3002/api');
  });
}

bootstrap();
