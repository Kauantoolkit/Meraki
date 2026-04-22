import { DomainException } from './domain.exception';

export class InvalidMilestoneTransitionError extends DomainException {
  constructor(action: string, currentStatus: string) {
    super(`Só é possível ${action} milestones ${currentStatus}`);
  }
}
