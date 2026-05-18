import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, Type } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { HateoasInterceptor } from '../hateoas/hateoas.interceptor';

export interface BootstrapHttpAppOptions {
  title: string;
  description: string;
  version?: string;
  port?: number | string;
  globalPrefix?: string;
  requiredEnvVars?: string[];
}

export async function bootstrapHttpApp(
  rootModule: Type<unknown>,
  options: BootstrapHttpAppOptions,
): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Validar variáveis de ambiente obrigatórias
  if (options.requiredEnvVars?.length) {
    const missing = options.requiredEnvVars.filter((k) => !process.env[k]);
    if (missing.length) {
      throw new Error(
        `Variáveis obrigatórias não configuradas: ${missing.join(', ')}`,
      );
    }
  }

  const app = await NestFactory.create(rootModule);

  // Prefixo global de rotas
  app.setGlobalPrefix(options.globalPrefix ?? 'api');

  // Validação automática dos DTOs via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtros globais de exceções
  app.useGlobalFilters(new HttpExceptionFilter(), new DomainExceptionFilter());

  // HATEOAS interceptor global
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new HateoasInterceptor(reflector));

  // CORS
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version ?? '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = options.port ?? process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`${options.title} rodando em http://localhost:${port}`);
  logger.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}
