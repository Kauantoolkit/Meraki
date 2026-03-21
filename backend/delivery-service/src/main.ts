import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('MERAKI — Delivery Service')
    .setDescription('Acompanhamento de entregas, Kanban board e histórico')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  app.enableCors();

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Delivery Service rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
