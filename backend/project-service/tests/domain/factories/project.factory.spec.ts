import { ProjectFactory, CreateProjectData } from '../../../src/domain/factories/project.factory';
import { ProjectStatus } from '../../../src/domain/enums/project-status.enum';
import { InvalidProjectScopeError } from '../../../src/domain/exceptions/invalid-project-scope.error';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function validData(): CreateProjectData {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  return {
    title: 'Projeto de Teste Completo',
    description: 'Descricao do projeto',
    requirements: ['Node.js', 'TypeScript'],
    budget: 10000,
    deadline: futureDate.toISOString(),
    companyId: 'company-1',
  };
}

describe('ProjectFactory — RN01', () => {
  let factory: ProjectFactory;

  beforeEach(() => {
    factory = new ProjectFactory();
  });

  it('deve criar projeto com dados validos', () => {
    const project = factory.create(validData());
    expect(project.title).toBe('Projeto de Teste Completo');
    expect(project.status).toBe(ProjectStatus.OPEN);
    expect(project.budget).toBeGreaterThan(0);
  });

  it('RN01: deve rejeitar titulo com menos de 10 caracteres', () => {
    const data = { ...validData(), title: 'Curto' };
    expect(() => factory.create(data)).toThrow(InvalidProjectScopeError);
  });

  it('RN01: deve rejeitar titulo vazio', () => {
    const data = { ...validData(), title: '' };
    expect(() => factory.create(data)).toThrow(InvalidProjectScopeError);
  });

  it('RN01: deve rejeitar projeto sem requisitos', () => {
    const data = { ...validData(), requirements: [] };
    expect(() => factory.create(data)).toThrow(InvalidProjectScopeError);
  });

  it('RN01: deve rejeitar budget zero ou negativo', () => {
    const data = { ...validData(), budget: 0 };
    expect(() => factory.create(data)).toThrow(DomainException);
  });

  it('RN01: deve rejeitar budget negativo', () => {
    const data = { ...validData(), budget: -500 };
    expect(() => factory.create(data)).toThrow(DomainException);
  });

  it('RN01: deve rejeitar deadline no passado', () => {
    const data = { ...validData(), deadline: '2020-01-01' };
    expect(() => factory.create(data)).toThrow(DomainException);
  });

  it('RN01: deve rejeitar deadline invalida', () => {
    const data = { ...validData(), deadline: 'data-invalida' };
    expect(() => factory.create(data)).toThrow(DomainException);
  });
});
