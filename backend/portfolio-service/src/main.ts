import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis obrigatórias não configuradas: ${missing.join(', ')}`);
}

async function bootstrap() {
  requireEnv(['JWT_SECRET', 'RABBITMQ_URL', 'DB_USER', 'DB_PASS', 'DB_NAME']);

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MERAKI — Portfolio Service')
    .setDescription('Portfólio, certificações, avaliações e perfis públicos (RF11–RF14)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  app.enableCors();

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Portfolio Service rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
