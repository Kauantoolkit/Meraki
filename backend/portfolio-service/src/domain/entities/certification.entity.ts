import { DomainException } from '../exceptions/domain.exception';

export class Certification {
  id: string;
  specialistId: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  credentialId: string;
  credentialUrl: string;
  createdAt: Date;

  isExpired(): boolean {
    if (!this.expiryDate) {
      return false;
    }
    return new Date() > this.expiryDate;
  }

  isValid(): boolean {
    return !!this.name && !!this.issuer && !this.isExpired();
  }

  updateExpiration(newExpiryDate: Date): void {
    if (newExpiryDate <= new Date()) {
      throw new DomainException('Data de expiração deve ser no futuro');
    }
    if (this.issueDate && newExpiryDate <= this.issueDate) {
      throw new DomainException('Data de expiração deve ser posterior à data de emissão');
    }
    this.expiryDate = newExpiryDate;
  }
}
