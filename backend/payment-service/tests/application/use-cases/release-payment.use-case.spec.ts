import { ReleasePaymentUseCase } from '../../../src/application/use-cases/release-payment.use-case';
import { PaymentFactory } from '../../../src/domain/factories/payment.factory';

describe('ReleasePaymentUseCase', () => {
  it('deve liberar o pagamento e atualizar o escrow', async () => {
    const mockPaymentRepo = {
      save: jest.fn().mockImplementation(async (payment) => payment),
    };
    const mockEscrowRepo = {
      findByProject: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(async (escrow) => escrow),
    };
    const mockEvents = {
      publishPaymentReleased: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ReleasePaymentUseCase(
      new PaymentFactory(),
      mockPaymentRepo as any,
      mockEscrowRepo as any,
      { rate: 0.10 } as any,
      mockEvents as any,
    );

    const dto = {
      milestoneId: 'milestone-1',
      projectId: 'project-1',
      amount: 2000,
      specialistId: 'specialist-1',
    };

    await useCase.execute(dto);

    expect(mockPaymentRepo.save).toHaveBeenCalledTimes(1);
    const savedPayment = (mockPaymentRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedPayment.status).toBe('RELEASED');
    expect(savedPayment.specialistAmount).toBe(1800);
    expect(savedPayment.platformFee).toBe(200);
    expect(mockEscrowRepo.findByProject).toHaveBeenCalledWith('project-1');
    expect(mockEscrowRepo.save).toHaveBeenCalledTimes(1);
    const escrowSaved = (mockEscrowRepo.save as jest.Mock).mock.calls[0][0];
    expect(escrowSaved.projectId).toBe('project-1');
    expect(escrowSaved.totalAmount).toBe(2000);
    expect(escrowSaved.releasedAmount).toBe(2000);
    expect(mockEvents.publishPaymentReleased).toHaveBeenCalledTimes(1);
    expect(mockEvents.publishPaymentReleased).toHaveBeenCalledWith(expect.objectContaining({
      milestoneId: 'milestone-1',
      projectId: 'project-1',
      amount: 2000,
      specialistId: 'specialist-1',
    }));
  });
});
