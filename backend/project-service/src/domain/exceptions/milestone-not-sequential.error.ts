import { DomainException } from './domain.exception';

export class MilestoneNotSequentialError extends DomainException {
  constructor(order?: number) {
    super(
      order
        ? `Não é possível iniciar o milestone ${order}: milestones anteriores ainda não aprovados (RN04)`
        : 'Não é possível iniciar o milestone: milestones anteriores ainda não aprovados (RN04)',
    );
  }
}
