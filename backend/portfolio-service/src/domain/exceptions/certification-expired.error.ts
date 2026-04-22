import { DomainException } from './domain.exception';

export class CertificationExpiredError extends DomainException {
  constructor(certificationName: string) {
    super(`Certificação '${certificationName}' está expirada`);
    this.name = 'CertificationExpiredError';
  }
}
