import { CompleteProjectUseCase } from '../../../src/application/use-cases/complete-project.use-case';
import { Project } from '../../../src/domain/entities/project.entity';
import { ProjectStatus } from '../../../src/domain/enums/project-status.enum';
import { Milestone } from '../../../src/domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../src/domain/enums/milestone-status.enum';
import { ContractFactory } from '../../../src/domain/factories/contract.factory';
import { ContractType } from '../../../src/domain/enums/contract-type.enum';

function createProject(): Project {
  const project = new Project();
  project.id = 'project-1';
  project.title = 'Projeto final';
  project.description = 'Descrição';
  project.requirements = ['Req 1'];
  project.budget = 5000;
  project.deadline = new Date();
  project.status = ProjectStatus.IN_PROGRESS;
  project.companyId = 'company-1';
  project.specialistId = 'specialist-1';
  return project;
}

function createApprovedMilestone(): Milestone {
  const milestone = new Milestone();
  milestone.id = 'milestone-1';
  milestone.projectId = 'project-1';
  milestone.title = 'Milestone aprovado';
  milestone.amount = 2500;
  milestone.status = MilestoneStatus.APPROVED;
  return milestone;
}

describe('CompleteProjectUseCase', () => {
  it('deve criar contrato de projeto quando concluir todos os milestones', async () => {
    const project = createProject();
    const mockProjectRepo = {
      findById: jest.fn().mockResolvedValue(project),
      save: jest.fn().mockImplementation(async (p) => p),
    };
    const mockMilestoneRepo = {
      findByProject: jest.fn().mockResolvedValue([createApprovedMilestone()]),
    };
    const mockContractRepo = {
      save: jest.fn().mockImplementation(async (c) => c),
    };
    const mockEvents = {
      publishProjectCompleted: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CompleteProjectUseCase(
      mockProjectRepo as any,
      mockMilestoneRepo as any,
      mockContractRepo as any,
      new ContractFactory(),
      mockEvents as any,
    );

    await useCase.execute('project-1', 'company-1');

    expect(mockProjectRepo.save).toHaveBeenCalledTimes(1);
    expect(project.status).toBe(ProjectStatus.COMPLETED);
    expect(mockContractRepo.save).toHaveBeenCalledTimes(1);
    const contractSaved = (mockContractRepo.save as jest.Mock).mock.calls[0][0];
    expect(contractSaved.type).toBe(ContractType.PROJECT);
    expect(contractSaved.projectId).toBe('project-1');
    expect(contractSaved.title).toContain('Projeto final');
    expect(mockEvents.publishProjectCompleted).toHaveBeenCalledTimes(1);
  });
});
