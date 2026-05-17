/**
 * RN04 integrado — valida que UpdateMilestoneStatusUseCase
 * propaga o MilestoneNotSequentialError quando milestone 2 é iniciado
 * antes do milestone 1 estar APPROVED.
 *
 * Usa fakes em memória para os repositórios e dependências externas,
 * preservando o contrato dos repositórios reais.
 */
import 'reflect-metadata';
import { UpdateMilestoneStatusUseCase } from '../../../src/application/use-cases/update-milestone-status.use-case';
import { Milestone } from '../../../src/domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../src/domain/enums/milestone-status.enum';
import { MilestoneNotSequentialError } from '../../../src/domain/exceptions/milestone-not-sequential.error';

function makeMilestone(id: string, order: number, status: MilestoneStatus): Milestone {
  const m = new Milestone();
  m.id = id;
  m.projectId = 'project-1';
  m.title = `Milestone ${order}`;
  m.description = 'x';
  m.amount = 100;
  m.order = order;
  m.status = status;
  return m;
}

describe('UpdateMilestoneStatusUseCase — RN04', () => {
  function setup(milestones: Milestone[]) {
    const milestoneRepo: any = {
      findById: jest.fn((id: string) => Promise.resolve(milestones.find((m) => m.id === id) || null)),
      findByProject: jest.fn(() => Promise.resolve(milestones)),
      save: jest.fn((m: Milestone) => Promise.resolve(m)),
    };
    const contractRepo: any = {
      save: jest.fn((c) => Promise.resolve(c)),
    };
    const contractFactory: any = {};
    const events: any = {
      publishMilestoneUpdated: jest.fn(() => Promise.resolve()),
    };
    const emitter: any = { emit: jest.fn() };
    const useCase = new UpdateMilestoneStatusUseCase(milestoneRepo, contractRepo, contractFactory, events, emitter);
    return { useCase, milestoneRepo, events, emitter };
  }

  it('RN04: bloqueia iniciar milestone 2 enquanto milestone 1 está PENDING', async () => {
    const m1 = makeMilestone('m1', 1, MilestoneStatus.PENDING);
    const m2 = makeMilestone('m2', 2, MilestoneStatus.PENDING);
    const { useCase } = setup([m1, m2]);

    await expect(useCase.execute('m2', 'start')).rejects.toBeInstanceOf(MilestoneNotSequentialError);
  });

  it('RN04: bloqueia iniciar milestone 2 enquanto milestone 1 está IN_PROGRESS', async () => {
    const m1 = makeMilestone('m1', 1, MilestoneStatus.IN_PROGRESS);
    const m2 = makeMilestone('m2', 2, MilestoneStatus.PENDING);
    const { useCase } = setup([m1, m2]);

    await expect(useCase.execute('m2', 'start')).rejects.toBeInstanceOf(MilestoneNotSequentialError);
  });

  it('RN04: bloqueia iniciar milestone 2 enquanto milestone 1 está SUBMITTED', async () => {
    const m1 = makeMilestone('m1', 1, MilestoneStatus.SUBMITTED);
    const m2 = makeMilestone('m2', 2, MilestoneStatus.PENDING);
    const { useCase } = setup([m1, m2]);

    await expect(useCase.execute('m2', 'start')).rejects.toBeInstanceOf(MilestoneNotSequentialError);
  });

  it('RN04: permite iniciar milestone 2 quando milestone 1 está APPROVED', async () => {
    const m1 = makeMilestone('m1', 1, MilestoneStatus.APPROVED);
    const m2 = makeMilestone('m2', 2, MilestoneStatus.PENDING);
    const { useCase, events, emitter } = setup([m1, m2]);

    const saved = await useCase.execute('m2', 'start');
    expect(saved.status).toBe(MilestoneStatus.IN_PROGRESS);
    expect(events.publishMilestoneUpdated).toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledWith('milestone.updated', expect.any(Object));
  });

  it('permite iniciar o primeiro milestone sem restrições', async () => {
    const m1 = makeMilestone('m1', 1, MilestoneStatus.PENDING);
    const { useCase } = setup([m1]);

    const saved = await useCase.execute('m1', 'start');
    expect(saved.status).toBe(MilestoneStatus.IN_PROGRESS);
  });
});
