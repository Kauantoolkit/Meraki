/**
 * Valida a documentação OpenAPI/Swagger sem precisar subir o servidor HTTP.
 * Monta apenas o módulo das interfaces (controllers) + dependências mockadas
 * e gera o documento OpenAPI via SwaggerModule.createDocument().
 */
import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';

import { ProjectController } from '../src/interfaces/controllers/project.controller';
import { MilestoneController } from '../src/interfaces/controllers/milestone.controller';
import { ProjectHistoryController } from '../src/interfaces/controllers/project-history.controller';

import { CreateProjectUseCase } from '../src/application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from '../src/application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '../src/application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../src/application/use-cases/update-project.use-case';
import { CancelProjectUseCase } from '../src/application/use-cases/cancel-project.use-case';
import { CompleteProjectUseCase } from '../src/application/use-cases/complete-project.use-case';
import { CreateMilestoneUseCase } from '../src/application/use-cases/create-milestone.use-case';
import { GetMilestonesByProjectUseCase } from '../src/application/use-cases/get-milestones-by-project.use-case';
import { UpdateMilestoneStatusUseCase } from '../src/application/use-cases/update-milestone-status.use-case';
import { GetProjectHistoryUseCase } from '../src/application/use-cases/get-project-history.use-case';

import { JwtAuthGuard } from '../src/interfaces/guards/jwt-auth.guard';

const stub = () => ({});

@Module({
  controllers: [ProjectController, MilestoneController, ProjectHistoryController],
  providers: [
    // Substitui o guard JWT por um stub que não exige passport configurado.
    { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
    { provide: CreateProjectUseCase, useFactory: stub },
    { provide: GetProjectsUseCase, useFactory: stub },
    { provide: GetProjectByIdUseCase, useFactory: stub },
    { provide: UpdateProjectUseCase, useFactory: stub },
    { provide: CancelProjectUseCase, useFactory: stub },
    { provide: CompleteProjectUseCase, useFactory: stub },
    { provide: CreateMilestoneUseCase, useFactory: stub },
    { provide: GetMilestonesByProjectUseCase, useFactory: stub },
    { provide: UpdateMilestoneStatusUseCase, useFactory: stub },
    { provide: GetProjectHistoryUseCase, useFactory: stub },
    Reflector,
  ],
})
class SwaggerTestModule {}

describe('Swagger / OpenAPI', () => {
  let doc: any;

  beforeAll(async () => {
    const app = await NestFactory.create(SwaggerTestModule, { logger: false });
    const config = new DocumentBuilder()
      .setTitle('MERAKI — Project Service')
      .setDescription('Gerenciamento de projetos e milestones')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    doc = SwaggerModule.createDocument(app, config);
    await app.close();
  });

  it('declara bearerAuth como securityScheme', () => {
    expect(doc.components.securitySchemes.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });

  it('documenta todos os endpoints de Project', () => {
    const paths = Object.keys(doc.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/api/projects',
        '/api/projects/{id}',
        '/api/projects/{id}/complete',
        '/api/projects/{id}/milestones',
        '/api/projects/milestones/{milestoneId}/start',
        '/api/projects/milestones/{milestoneId}/submit',
        '/api/projects/milestones/{milestoneId}/approve',
        '/api/projects/milestones/{milestoneId}/reject',
        '/api/projects/{id}/history',
      ]),
    );
  });

  it('endpoint POST /api/projects exige bearer auth', () => {
    const op = doc.paths['/api/projects'].post;
    expect(op.security).toEqual(expect.arrayContaining([expect.objectContaining({ bearer: expect.any(Array) })]));
  });

  it('endpoint POST /api/projects referencia CreateProjectDto', () => {
    const op = doc.paths['/api/projects'].post;
    const ref = op.requestBody.content['application/json'].schema.$ref;
    expect(ref).toBe('#/components/schemas/CreateProjectDto');
  });

  it('CreateProjectDto contém todos os campos com schemas corretos', () => {
    const schema = doc.components.schemas.CreateProjectDto;
    expect(schema).toBeDefined();
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining(['title', 'description', 'requirements', 'budget', 'deadline']),
    );
    expect(schema.required).toEqual(expect.arrayContaining(['title', 'description', 'requirements', 'budget', 'deadline']));
  });

  it('CreateMilestoneDto contém todos os campos esperados', () => {
    const schema = doc.components.schemas.CreateMilestoneDto;
    expect(schema).toBeDefined();
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining(['title', 'description', 'amount', 'dueDate']),
    );
    // RN07: dueDate é opcional
    expect(schema.required || []).not.toContain('dueDate');
    expect(schema.required).toEqual(expect.arrayContaining(['title', 'description', 'amount']));
  });

  it('UpdateProjectDto contém todos os campos como opcionais', () => {
    const schema = doc.components.schemas.UpdateProjectDto;
    expect(schema).toBeDefined();
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining(['title', 'description', 'requirements', 'budget', 'deadline']),
    );
    // Update DTO: tudo opcional
    expect(schema.required || []).toEqual([]);
  });

  it('GET /api/projects/{id}/history tem operação documentada', () => {
    const op = doc.paths['/api/projects/{id}/history'].get;
    expect(op.summary).toMatch(/Histórico/);
    expect(op.responses['200']).toBeDefined();
  });
});
