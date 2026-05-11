import { ContractFactory } from '../../../src/domain/factories/contract.factory';
import { ContractType } from '../../../src/domain/enums/contract-type.enum';
import { ContractStatus } from '../../../src/domain/enums/contract-status.enum';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('ContractFactory', () => {
  let factory: ContractFactory;

  beforeEach(() => {
    factory = new ContractFactory();
  });

  it('deve criar contrato valido', () => {
    const contract = factory.create({
      projectId: 'project-1',
      milestoneId: 'milestone-1',
      type: ContractType.MILESTONE,
      title: 'Contrato de milestone',
      content: 'Conteudo do contrato',
    });

    expect(contract.projectId).toBe('project-1');
    expect(contract.type).toBe(ContractType.MILESTONE);
    expect(contract.status).toBe(ContractStatus.FINALIZED);
    expect(contract.createdAt).toBeInstanceOf(Date);
    expect(contract.finalizedAt).toBeInstanceOf(Date);
  });

  it('deve rejeitar contract sem projectId', () => {
    expect(() => factory.create({
      projectId: '',
      type: ContractType.PROJECT,
      title: 'Contrato',
      content: 'Conteudo',
    } as any)).toThrow(DomainException);
  });

  it('deve rejeitar contract sem title', () => {
    expect(() => factory.create({
      projectId: 'project-1',
      type: ContractType.PROJECT,
      title: '   ',
      content: 'Conteudo',
    })).toThrow(DomainException);
  });

  it('deve rejeitar contract sem content', () => {
    expect(() => factory.create({
      projectId: 'project-1',
      type: ContractType.PROJECT,
      title: 'Contrato',
      content: '   ',
    })).toThrow(DomainException);
  });
});
