import { UpdateMilestoneStatusUseCase } from '../../../src/application/use-cases/update-milestone-status.use-case';
import { Milestone } from '../../../src/domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../src/domain/enums/milestone-status.enum';

function createMilestone(): Milestone {
  const milestone = new Milestone();
  milestone.id = 'milestone-1';
  milestone.projectId = 'project-1';
  milestone.title = 'Primeiro milestone';
  milestone.description = 'Entrega inicial';
  milestone.amount = 1500;
  milestone.status = MilestoneStatus.SUBMITTED;
  milestone.order = 1;
  return milestone;
}

describe('UpdateMilestoneStatusUseCase', () => {
  it('deve criar contrato de milestone quando aprovar milestone', async () => {
    const milestone = createMilestone();
    const mockMilestoneRepo = {
      findById: jest.fn().mockResolvedValue(milestone),
      findByProject: jest.fn(),
      save: jest.fn().mockImplementation(async (m) => m),
    };
    const mockEvents = {
      publishMilestoneUpdated: jest.fn().mockResolvedValue(undefined),
    };
    const mockEmitter = { emit: jest.fn() };

    const useCase = new UpdateMilestoneStatusUseCase(
      mockMilestoneRepo as any,
      mockEvents as any,
      mockEmitter as any,
    );

    const result = await useCase.execute('milestone-1', 'approve');

    expect(result.status).toBe(MilestoneStatus.APPROVED);
    expect(mockEvents.publishMilestoneUpdated).toHaveBeenCalledTimes(1);
    expect(mockEmitter.emit).toHaveBeenCalledWith('milestone.updated', expect.any(Object));
  });
});
