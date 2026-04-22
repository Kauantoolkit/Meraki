import { MilestoneProgressionDomainService } from '../../../src/domain/services/milestone-progression.domain-service';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

describe('MilestoneProgressionDomainService — RN04 (Delivery Context)', () => {
  let service: MilestoneProgressionDomainService;

  beforeEach(() => {
    service = new MilestoneProgressionDomainService();
  });

  it('deve permitir iniciar milestone 1 sempre', () => {
    const statuses = new Map([[1, 'PENDING']]);
    expect(service.canStart(1, statuses)).toBe(true);
  });

  it('deve permitir milestone 2 quando 1 esta APPROVED', () => {
    const statuses = new Map([[1, 'APPROVED'], [2, 'PENDING']]);
    expect(service.canStart(2, statuses)).toBe(true);
  });

  it('RN04: deve bloquear milestone 2 quando 1 esta PENDING', () => {
    const statuses = new Map([[1, 'PENDING'], [2, 'PENDING']]);
    expect(service.canStart(2, statuses)).toBe(false);
  });

  it('assertCanStart deve lancar DomainException', () => {
    const statuses = new Map([[1, 'IN_PROGRESS'], [2, 'PENDING']]);
    expect(() => service.assertCanStart(2, statuses)).toThrow(DomainException);
  });
});
