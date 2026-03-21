import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './interfaces/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('MERAKI — Project Service')
    .setDescription('Gerenciamento de projetos e milestones')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  app.enableCors();

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Project Service rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
