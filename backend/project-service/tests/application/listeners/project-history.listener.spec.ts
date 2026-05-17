/**
 * RN07 — Histórico automático via ProjectHistoryListener.
 *
 * Sobe um EventEmitterModule real (mesmo do AppModule) e injeta um
 * ProjectHistoryRepository falso. Dispara os eventos com EventEmitter2.emit()
 * — exatamente o mesmo método usado pelos use cases — e verifica que o
 * listener gravou o histórico esperado.
 */
import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

import { ProjectHistoryListener } from '../../../src/application/listeners/project-history.listener';
import { ProjectHistoryRepository } from '../../../src/infrastructure/repositories/project-history.repository';
import { ProjectCreatedEvent } from '../../../src/domain/events/project-created.event';
import { MilestoneCreatedEvent } from '../../../src/domain/events/milestone-created.event';
import { MilestoneUpdatedEvent } from '../../../src/domain/events/milestone-updated.event';
import { ProjectHistoryAction } from '../../../src/domain/enums/project-history-action.enum';

class InMemoryProjectHistoryRepository {
  saved: any[] = [];
  save(entry: any) {
    const stored = { id: `h-${this.saved.length + 1}`, createdAt: new Date(), ...entry };
    this.saved.push(stored);
    return Promise.resolve(stored);
  }
  findByProject(projectId: string) {
    return Promise.resolve(this.saved.filter((e) => e.projectId === projectId));
  }
}

describe('ProjectHistoryListener — RN07', () => {
  let emitter: EventEmitter2;
  let repo: InMemoryProjectHistoryRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        ProjectHistoryListener,
        { provide: ProjectHistoryRepository, useClass: InMemoryProjectHistoryRepository },
      ],
    }).compile();

    // Garante que o subscriber esteja registrado antes do emit
    await module.init();

    emitter = module.get(EventEmitter2);
    repo = module.get(ProjectHistoryRepository) as unknown as InMemoryProjectHistoryRepository;
  });

  it('grava PROJECT_CREATED quando o evento project.created é emitido', async () => {
    const event = new ProjectCreatedEvent({
      projectId: 'p-1',
      title: 'Projeto Teste de Validação',
      budget: 5000,
      companyId: 'c-1',
    });

    emitter.emit('project.created', event);
    await new Promise((r) => setImmediate(r));

    expect(repo.saved).toHaveLength(1);
    expect(repo.saved[0]).toMatchObject({
      projectId: 'p-1',
      action: ProjectHistoryAction.PROJECT_CREATED,
    });
    expect(repo.saved[0].description).toContain('Projeto Teste de Validação');
  });

  it('grava MILESTONE_CREATED quando o evento milestone.created é emitido', async () => {
    const event = new MilestoneCreatedEvent({
      milestoneId: 'm-1',
      projectId: 'p-1',
      amount: 1000,
      order: 1,
    });

    emitter.emit('milestone.created', event);
    await new Promise((r) => setImmediate(r));

    expect(repo.saved).toHaveLength(1);
    expect(repo.saved[0]).toMatchObject({
      projectId: 'p-1',
      action: ProjectHistoryAction.MILESTONE_CREATED,
    });
    expect(repo.saved[0].description).toContain('m-1');
  });

  it('grava MILESTONE_UPDATED quando o evento milestone.updated é emitido', async () => {
    const event = new MilestoneUpdatedEvent({
      milestoneId: 'm-1',
      projectId: 'p-1',
      status: 'IN_PROGRESS',
    });

    emitter.emit('milestone.updated', event);
    await new Promise((r) => setImmediate(r));

    expect(repo.saved).toHaveLength(1);
    expect(repo.saved[0]).toMatchObject({
      projectId: 'p-1',
      action: ProjectHistoryAction.MILESTONE_UPDATED,
    });
    expect(repo.saved[0].description).toContain('IN_PROGRESS');
  });

  it('cenário completo do enunciado: criar projeto → criar milestone → mudar status', async () => {
    emitter.emit(
      'project.created',
      new ProjectCreatedEvent({ projectId: 'p-X', title: 'Projeto E2E Listener', budget: 10000, companyId: 'c-1' }),
    );
    emitter.emit(
      'milestone.created',
      new MilestoneCreatedEvent({ milestoneId: 'm-X', projectId: 'p-X', amount: 1500, order: 1 }),
    );
    emitter.emit(
      'milestone.updated',
      new MilestoneUpdatedEvent({ milestoneId: 'm-X', projectId: 'p-X', status: 'IN_PROGRESS' }),
    );

    await new Promise((r) => setImmediate(r));

    const historyForProject = await repo.findByProject('p-X');
    expect(historyForProject).toHaveLength(3);
    expect(historyForProject.map((h) => h.action)).toEqual([
      ProjectHistoryAction.PROJECT_CREATED,
      ProjectHistoryAction.MILESTONE_CREATED,
      ProjectHistoryAction.MILESTONE_UPDATED,
    ]);
  });
});
