import { Milestone } from '../../../src/domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../src/domain/enums/milestone-status.enum';
import { MilestoneNotSequentialError } from '../../../src/domain/exceptions/milestone-not-sequential.error';
import { InvalidMilestoneTransitionError } from '../../../src/domain/exceptions/invalid-milestone-transition.error';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createMilestone(order: number, status: MilestoneStatus = MilestoneStatus.PENDING): Milestone {
  const m = new Milestone();
  m.id = `milestone-${order}`;
  m.projectId = 'project-1';
  m.title = `Milestone ${order}`;
  m.description = 'Descricao';
  m.amount = 1000;
  m.order = order;
  m.status = status;
  return m;
}

describe('Milestone Entity — RN04', () => {
  describe('start()', () => {
    it('deve iniciar o primeiro milestone sem restricoes', () => {
      const m1 = createMilestone(1);
      m1.start([m1]);
      expect(m1.status).toBe(MilestoneStatus.IN_PROGRESS);
    });

    it('RN04: deve iniciar milestone quando anteriores estao APPROVED', () => {
      const m1 = createMilestone(1, MilestoneStatus.APPROVED);
      const m2 = createMilestone(2);

      m2.start([m1, m2]);
      expect(m2.status).toBe(MilestoneStatus.IN_PROGRESS);
    });

    it('RN04: deve impedir inicio quando milestone anterior nao esta APPROVED', () => {
      const m1 = createMilestone(1, MilestoneStatus.IN_PROGRESS);
      const m2 = createMilestone(2);

      expect(() => m2.start([m1, m2])).toThrow(MilestoneNotSequentialError);
    });

    it('RN04: deve impedir inicio quando milestone anterior esta PENDING', () => {
      const m1 = createMilestone(1, MilestoneStatus.PENDING);
      const m2 = createMilestone(2);

      expect(() => m2.start([m1, m2])).toThrow(MilestoneNotSequentialError);
    });

    it('RN04: deve impedir inicio do terceiro se o segundo nao esta APPROVED', () => {
      const m1 = createMilestone(1, MilestoneStatus.APPROVED);
      const m2 = createMilestone(2, MilestoneStatus.SUBMITTED);
      const m3 = createMilestone(3);

      expect(() => m3.start([m1, m2, m3])).toThrow(MilestoneNotSequentialError);
    });

    it('deve impedir iniciar milestone ja iniciado', () => {
      const m1 = createMilestone(1, MilestoneStatus.IN_PROGRESS);

      expect(() => m1.start([m1])).toThrow(DomainException);
    });
  });

  describe('submit()', () => {
    it('deve submeter milestone IN_PROGRESS', () => {
      const m = createMilestone(1, MilestoneStatus.IN_PROGRESS);
      m.submit();
      expect(m.status).toBe(MilestoneStatus.SUBMITTED);
    });

    it('deve falhar ao submeter milestone PENDING', () => {
      const m = createMilestone(1);
      expect(() => m.submit()).toThrow(InvalidMilestoneTransitionError);
    });
  });

  describe('approve()', () => {
    it('deve aprovar milestone SUBMITTED', () => {
      const m = createMilestone(1, MilestoneStatus.SUBMITTED);
      m.approve();
      expect(m.status).toBe(MilestoneStatus.APPROVED);
    });

    it('deve falhar ao aprovar milestone que nao e SUBMITTED', () => {
      const m = createMilestone(1, MilestoneStatus.IN_PROGRESS);
      expect(() => m.approve()).toThrow(InvalidMilestoneTransitionError);
    });
  });

  describe('reject()', () => {
    it('deve rejeitar milestone SUBMITTED e voltar para IN_PROGRESS', () => {
      const m = createMilestone(1, MilestoneStatus.SUBMITTED);
      m.reject();
      expect(m.status).toBe(MilestoneStatus.IN_PROGRESS);
    });

    it('deve falhar ao rejeitar milestone que nao e SUBMITTED', () => {
      const m = createMilestone(1, MilestoneStatus.PENDING);
      expect(() => m.reject()).toThrow(InvalidMilestoneTransitionError);
    });
  });
});
