import { DomainException } from './domain.exception';

export class InvalidProjectScopeError extends DomainException {
  constructor(reason: string) {
    super(`${reason} (RN01)`);
  }
}
