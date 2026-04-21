import { Project } from '../../../src/domain/entities/project.entity';
import { ProjectStatus } from '../../../src/domain/enums/project-status.enum';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createProject(overrides: Partial<Project> = {}): Project {
  const p = new Project();
  p.id = 'project-1';
  p.title = 'Projeto Teste';
  p.description = 'Descricao';
  p.requirements = ['Node.js'];
  p.budget = 10000;
  p.deadline = new Date('2030-01-01');
  p.status = ProjectStatus.OPEN;
  p.companyId = 'company-1';
  Object.assign(p, overrides);
  return p;
}

describe('Project Entity', () => {
  describe('assignSpecialist()', () => {
    it('deve atribuir especialista a projeto OPEN', () => {
      const p = createProject();
      p.assignSpecialist('specialist-1', 'bid-1');

      expect(p.specialistId).toBe('specialist-1');
      expect(p.bidId).toBe('bid-1');
      expect(p.status).toBe(ProjectStatus.IN_PROGRESS);
    });

    it('deve rejeitar atribuicao em projeto IN_PROGRESS', () => {
      const p = createProject({ status: ProjectStatus.IN_PROGRESS });
      expect(() => p.assignSpecialist('s1', 'b1')).toThrow(DomainException);
    });

    it('deve rejeitar atribuicao em projeto COMPLETED', () => {
      const p = createProject({ status: ProjectStatus.COMPLETED });
      expect(() => p.assignSpecialist('s1', 'b1')).toThrow(DomainException);
    });
  });

  describe('complete()', () => {
    it('deve concluir projeto IN_PROGRESS', () => {
      const p = createProject({ status: ProjectStatus.IN_PROGRESS });
      p.complete();
      expect(p.status).toBe(ProjectStatus.COMPLETED);
    });

    it('deve rejeitar conclusao de projeto OPEN', () => {
      const p = createProject({ status: ProjectStatus.OPEN });
      expect(() => p.complete()).toThrow(DomainException);
    });
  });

  describe('cancel()', () => {
    it('deve cancelar projeto OPEN', () => {
      const p = createProject({ status: ProjectStatus.OPEN });
      p.cancel();
      expect(p.status).toBe(ProjectStatus.CANCELLED);
    });

    it('deve cancelar projeto IN_PROGRESS', () => {
      const p = createProject({ status: ProjectStatus.IN_PROGRESS });
      p.cancel();
      expect(p.status).toBe(ProjectStatus.CANCELLED);
    });

    it('deve rejeitar cancelamento de projeto COMPLETED', () => {
      const p = createProject({ status: ProjectStatus.COMPLETED });
      expect(() => p.cancel()).toThrow(DomainException);
    });
  });
});
